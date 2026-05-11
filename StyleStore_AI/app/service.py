from __future__ import annotations

import re
import unicodedata
from typing import Any

from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from .config import Settings
from .vectorstore import get_vectorstore


def get_llm(settings: Settings):
    provider = settings.llm_provider.strip().lower()

    if provider == "ollama":
        return ChatOllama(model=settings.llm_model, base_url=settings.ollama_base_url, temperature=0.2)

    if provider == "gemini":
        return ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.gemini_api_key,
            temperature=0.2,
        )

    if provider == "openai":
        return ChatOpenAI(
            model=settings.llm_model,
            temperature=0.2,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
        )

    raise ValueError(f"Unsupported LLM provider: {settings.llm_provider}")


def _product_from_metadata(metadata: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": metadata.get("product_id"),
        "name": metadata.get("name"),
        "price": metadata.get("price"),
        "category": metadata.get("category"),
        "brand": metadata.get("brand"),
        "thumbnail": metadata.get("thumbnail"),
    }


def _normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    without_marks = "".join(char for char in normalized if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", without_marks.lower()).strip()


def _value_matches_query(value: Any, query_text: str) -> bool:
    if value is None:
        return False

    value_text = _normalize_text(str(value))
    query_text = _normalize_text(query_text)
    if not value_text or not query_text:
        return False

    return value_text in query_text or query_text in value_text


def _extract_stock(metadata: dict[str, Any]) -> int | None:
    stock_value = metadata.get("stock")
    if isinstance(stock_value, bool):
        return None
    if isinstance(stock_value, int):
        return stock_value
    if isinstance(stock_value, float):
        return int(stock_value)
    return None


def _semantic_score_map(vectorstore: Any, query_text: str, limit: int) -> dict[int, float]:
    try:
        scored_docs = vectorstore.similarity_search_with_relevance_scores(query_text, k=limit)
    except Exception:
        return {}

    score_map: dict[int, float] = {}
    for doc, score in scored_docs:
        metadata = doc.metadata or {}
        product_id = metadata.get("product_id")
        if isinstance(product_id, int):
            score_map[product_id] = float(score)
    return score_map


def _is_specific_query(question: str, explicit_filters: dict[str, Any], candidates: list[dict[str, Any]]) -> bool:
    if explicit_filters:
        return True

    normalized_question = _normalize_text(question)
    token_count = len(normalized_question.split())

    broad_patterns = (
        "goi y",
        "de xuat",
        "tu van",
        "nen mua",
        "mac gi",
        "phoi do",
        "outfit",
        "look",
    )
    broad_query = any(pattern in normalized_question for pattern in broad_patterns)
    if broad_query and token_count <= 10:
        return False

    if token_count >= 12 and not broad_query:
        return True

    category_hits = sum(1 for candidate in candidates if _value_matches_query(candidate["metadata"].get("category"), normalized_question))
    brand_hits = sum(1 for candidate in candidates if _value_matches_query(candidate["metadata"].get("brand"), normalized_question))
    return (category_hits + brand_hits) > 0


def _rank_candidates(
    docs: list[Any],
    question: str,
    gender: str | None,
    category: str | None,
    brand: str | None,
    max_price: float | None,
    vectorstore: Any,
) -> list[dict[str, Any]]:
    candidate_map: dict[int, dict[str, Any]] = {}

    # Normalized requested gender for strict matching (if provided).
    gender_norm = _normalize_text(gender) if gender else None

    for index, doc in enumerate(docs):
        metadata = doc.metadata or {}
        product_id = metadata.get("product_id")
        name = metadata.get("name")
        price = metadata.get("price")

        # If user requested a specific gender, skip candidates that do not match.
        doc_gender = metadata.get("gender")
        if gender_norm and not _value_matches_query(doc_gender, gender_norm):
            continue

        if not isinstance(product_id, int) or not isinstance(name, str) or not name.strip():
            continue

        if max_price is not None and isinstance(price, (int, float)) and price > max_price:
            continue

        candidate_map.setdefault(
            product_id,
            {
                "product_id": product_id,
                "metadata": metadata,
                "doc_index": index,
                "semantic_score": None,
                "category_match": False,
                "gender_match": False,
                "brand_match": False,
                "stock": None,
            },
        )

    if not candidate_map:
        return []

    score_map = _semantic_score_map(vectorstore, question, max(1, len(candidate_map)))
    normalized_question = _normalize_text(question)

    for candidate in candidate_map.values():
        metadata = candidate["metadata"]
        candidate["semantic_score"] = score_map.get(candidate["product_id"])
        candidate["category_match"] = _value_matches_query(metadata.get("category"), category or normalized_question)
        candidate["gender_match"] = _value_matches_query(metadata.get("gender"), gender or normalized_question)
        candidate["brand_match"] = _value_matches_query(metadata.get("brand"), brand or normalized_question)
        candidate["stock"] = _extract_stock(metadata)

    # Sort by explicit metadata matches first, then by semantic relevance and recency in the retrieved list.
    return sorted(
        candidate_map.values(),
        key=lambda candidate: (
            1 if candidate["category_match"] else 0,
            1 if candidate["gender_match"] else 0,
            1 if candidate["brand_match"] else 0,
            1 if candidate["stock"] is None or candidate["stock"] > 0 else 0,
            candidate["semantic_score"] if candidate["semantic_score"] is not None else float("-inf"),
            -candidate["doc_index"],
        ),
        reverse=True,
    )


def _result_limit(question: str, explicit_filters: dict[str, Any], candidates: list[dict[str, Any]]) -> int:
    if not candidates:
        return 0

    return 3 if _is_specific_query(question, explicit_filters, candidates) else 5


def answer_question(
    settings: Settings,
    question: str,
    top_k: int,
    gender: str | None = None,
    category: str | None = None,
    brand: str | None = None,
    max_price: float | None = None,
) -> tuple[str, list[int], list[dict[str, Any]], int]:
    vectorstore = get_vectorstore(settings)

    # Pull a slightly wider candidate pool, then rank down to the final 3-5 products.
    candidate_k = max(8, top_k * 3)
    search_kwargs: dict[str, Any] = {"k": candidate_k}

    metadata_filter: dict[str, Any] = {}
    if gender:
        metadata_filter["gender"] = gender
    if category:
        metadata_filter["category"] = category
    if brand:
        metadata_filter["brand"] = brand
    if metadata_filter:
        search_kwargs["filter"] = metadata_filter

    retriever = vectorstore.as_retriever(search_kwargs=search_kwargs)

    llm = get_llm(settings)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a fashion retail assistant for StyleStore. Answer in Vietnamese. "
                "Use only the provided product list as your source of truth. "
                "If the list is insufficient, ask one short clarifying question. "
                "Write a natural recommendation, keep it concise, and do not invent products or output JSON. "
                "Do not list every product unless the user explicitly asks for a full list.",
            ),
            (
                "human",
                "Question: {input}\n\nCandidate products:\n{context}",
            ),
        ]
    )

    constraints = []
    if gender:
        constraints.append(f"gender={gender}")
    if category:
        constraints.append(f"category={category}")
    if brand:
        constraints.append(f"brand={brand}")
    if max_price is not None:
        constraints.append(f"max_price={max_price}")

    input_text = question
    if constraints:
        input_text = f"{question}\n\nConstraints: {', '.join(constraints)}"

    docs = retriever.invoke(input_text)
    ranked_candidates = _rank_candidates(
        docs=docs,
        question=input_text,
        gender=gender,
        category=category,
        brand=brand,
        max_price=max_price,
        vectorstore=vectorstore,
    )

    result_limit = _result_limit(input_text, metadata_filter, ranked_candidates)
    selected_candidates = ranked_candidates[:result_limit]

    context_lines: list[str] = []
    for candidate in selected_candidates:
        metadata = candidate["metadata"]
        product_line = (
            f"- {metadata.get('name')} | brand={metadata.get('brand') or 'unknown'} | "
            f"category={metadata.get('category') or 'unknown'} | price={metadata.get('price')}"
        )
        stock_value = metadata.get("stock")
        if stock_value is not None:
            product_line += f" | stock={stock_value}"
        context_lines.append(product_line)

    if not context_lines:
        context_lines = ["- No suitable candidate products found."]

    messages = prompt.format_messages(input=input_text, context="\n".join(context_lines))
    result = llm.invoke(messages)
    answer_text = str(getattr(result, "content", result)).strip()

    products = [_product_from_metadata(candidate["metadata"]) for candidate in selected_candidates]
    product_ids = [product["id"] for product in products if isinstance(product.get("id"), int)]

    return answer_text, product_ids, products, len(docs)