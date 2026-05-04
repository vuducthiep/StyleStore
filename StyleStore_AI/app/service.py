from __future__ import annotations

import json
import unicodedata
import re
from typing import Any

from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.chat_models import ChatOllama
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


def _strip_markdown(value: str) -> str:
    cleaned = re.sub(r"[*_`~]+", "", value)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def _extract_answer_text(raw_response: str) -> str:
    text = raw_response.strip()
    candidate = text

    fenced_match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", candidate, flags=re.S | re.I)
    if fenced_match:
        candidate = fenced_match.group(1).strip()
    else:
        json_match = re.search(r"\{.*\}", candidate, flags=re.S)
        if json_match:
            candidate = json_match.group(0).strip()

    try:
        payload = json.loads(candidate)
    except json.JSONDecodeError:
        return text

    answer = str(payload.get("answer", "")).strip()
    return answer or text


def _pick_product_ids_from_answer(answer: str, docs: list[Any], max_price: float | None = None) -> list[int]:
    cleaned_answer = _strip_markdown(answer)
    normalized_answer = _normalize_text(cleaned_answer)
    answer_segments = [segment.strip() for segment in re.split(r"\n+|(?<=\.)\s+", cleaned_answer) if segment.strip()]
    if not answer_segments:
        answer_segments = [cleaned_answer]

    doc_entries: list[tuple[int, str, str]] = []
    for doc in docs:
        metadata = doc.metadata or {}
        product_id = metadata.get("product_id")
        name = str(metadata.get("name") or "").strip()
        price = metadata.get("price")

        if not isinstance(product_id, int) or not name:
            continue

        if max_price is not None and isinstance(price, (int, float)) and price > max_price:
            continue

        normalized_name = _normalize_text(name)
        if not normalized_name:
            continue

        doc_entries.append((product_id, name, normalized_name))

    matched_ids: list[int] = []
    seen_ids: set[int] = set()

    for segment in answer_segments:
        normalized_segment = _normalize_text(segment)
        if not normalized_segment:
            continue

        best_match: tuple[int, int] | None = None
        for entry_index, (product_id, _name, normalized_name) in enumerate(doc_entries):
            if product_id in seen_ids:
                continue

            if normalized_name not in normalized_segment:
                continue

            score = len(normalized_name)
            if best_match is None or score > best_match[0] or (score == best_match[0] and entry_index < best_match[1]):
                best_match = (score, entry_index)

        if best_match is None:
            continue

        chosen_id = doc_entries[best_match[1]][0]
        if chosen_id in seen_ids:
            continue

        seen_ids.add(chosen_id)
        matched_ids.append(chosen_id)

    if matched_ids:
        return matched_ids

    # Only use a conservative fallback when the answer does not mention any product name explicitly.
    fallback_ids: list[int] = []
    for product_id, _name, _normalized_name in doc_entries:
        if product_id in seen_ids:
            continue
        if product_id in fallback_ids:
            continue
        if len(fallback_ids) >= 3:
            break
        fallback_ids.append(product_id)

    return fallback_ids


def answer_question(
    settings: Settings,
    question: str,
    top_k: int,
    gender: str | None = None,
    category: str | None = None,
    brand: str | None = None,
    max_price: float | None = None,
) -> tuple[str, list[dict[str, Any]], int]:
    vectorstore = get_vectorstore(settings)
    search_kwargs: dict[str, Any] = {"k": max(top_k * 3, top_k)}

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
                "Use only the provided product context. If the context is insufficient, ask a short clarifying question. "
                "Write a natural Vietnamese recommendation and mention the exact product names and brands from the context. "
                "Do not invent products. Do not output JSON.",
            ),
            (
                "human",
                "Question: {input}\n\nProduct context:\n{context}",
            ),
        ]
    )

    combine_docs_chain = create_stuff_documents_chain(llm, prompt)
    retrieval_chain = create_retrieval_chain(retriever, combine_docs_chain)
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

    result = retrieval_chain.invoke({"input": input_text})

    docs = result.get("context", [])
    answer_text = _extract_answer_text(result.get("answer", ""))

    metadata_by_id: dict[int, dict[str, Any]] = {}
    for doc in docs:
        metadata = doc.metadata or {}
        product_id = metadata.get("product_id")
        if isinstance(product_id, int) and product_id not in metadata_by_id:
            metadata_by_id[product_id] = metadata

    product_ids = _pick_product_ids_from_answer(answer_text, docs, max_price=max_price)
    if not product_ids:
        for doc in docs:
            metadata = doc.metadata or {}
            product_id = metadata.get("product_id")
            price = metadata.get("price")
            if max_price is not None and isinstance(price, (int, float)) and price > max_price:
                continue
            if isinstance(product_id, int):
                product_ids.append(product_id)
                if len(product_ids) >= top_k:
                    break

    products = []
    seen_ids: set[int] = set()
    for product_id in product_ids:
        if product_id in seen_ids:
            continue
        metadata = metadata_by_id.get(product_id)
        if not metadata:
            continue
        price = metadata.get("price")
        if max_price is not None and isinstance(price, (int, float)) and price > max_price:
            continue
        seen_ids.add(product_id)
        products.append(_product_from_metadata(metadata))

    return answer_text, product_ids, products, len(docs)
