import { pageContent } from "@/config/content";
import { BookOpen } from "lucide-react";

export default function BlogPage() {
    return (
        <div className="container mx-auto px-4 py-20 sm:px-6 max-w-6xl">
            <div className="mb-16 flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <BookOpen className="h-8 w-8" />
                </div>
                <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">
                    Latest Updates & <span className="text-blue-400">Insights</span>
                </h1>
                <p className="max-w-2xl text-lg text-slate-400">
                    Discover how AI is transforming Ayush healthcare, read our technical deep-dives, and stay updated with our platform.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pageContent.blog.map((post) => (
                    <div
                        key={post.id}
                        className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0f172a]/60 p-8 transition-all hover:bg-white/5 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                    >
                        <div>
                            <div className="mb-4 inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                                {post.date}
                            </div>
                            <h3 className="mb-4 text-2xl font-bold text-white leading-snug">
                                {post.title}
                            </h3>
                            <p className="mb-8 text-base text-slate-400 leading-relaxed">
                                {post.excerpt}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
