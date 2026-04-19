import { Bot, Sparkles } from 'lucide-react';

type AIChatHeroProps = {
    quickPrompts: string[];
    onPromptClick: (prompt: string) => void;
};

const AIChatHero = ({ quickPrompts, onPromptClick }: AIChatHeroProps) => {
    return (
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-orange-200/70 bg-white/75 shadow-[0_30px_80px_-30px_rgba(234,88,12,0.35)] backdrop-blur-xl lg:mb-8">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="p-6 sm:p-8 lg:p-12">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                        <Sparkles className="h-4 w-4" />
                        AI tư vấn sản phẩm
                    </div>
                    <h1 className="max-w-xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                        Chọn đúng sản phẩm nhanh hơn, ít phải đoán hơn.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base lg:text-lg">
                        Hỏi theo nhu cầu thực tế như giới tính, phong cách, ngân sách, màu sắc hoặc chất liệu.
                        AI sẽ đọc catalog hiện tại và gợi ý sản phẩm phù hợp nhất.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {quickPrompts.map((prompt) => (
                            <button
                                key={prompt}
                                type="button"
                                onClick={() => onPromptClick(prompt)}
                                className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-700"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white sm:p-8 lg:p-12">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-300">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-300">Tư vấn theo sản phẩm thực tế của shop</p>
                            <p className="text-lg font-semibold">RAG + LangChain</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        {['Gợi ý theo giá', 'Gợi ý theo giới tính', 'Gợi ý theo danh mục', 'Gợi ý theo chất liệu'].map((item) => (
                            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-medium text-slate-100">{item}</p>
                            </div>
                        ))}
                    </div>

                    <p className="mt-8 text-sm leading-6 text-slate-300">
                        Phù hợp khi khách cần hỏi nhanh kiểu “nên mua gì”, “mẫu nào hợp”, hoặc “sản phẩm nào dưới mức giá X”.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AIChatHero;
