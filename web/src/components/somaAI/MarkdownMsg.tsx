"use client";

import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

function CodeBlock({ children }: { children: ReactNode }) {
    const [copied, setCopied] = useState(false);

    const child = Children.toArray(children)[0];
    const codeProps = isValidElement(child)
        ? (child as ReactElement<{ className?: string; children?: ReactNode }>)
            .props
        : { className: "", children: "" };

    const language = /language-([\w-]+)/.exec(codeProps.className || "")?.[1];
    const text = String(codeProps.children ?? "").replace(/\n$/, "");

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard unavailable */
        }
    };

    return (
        <div className="my-3 overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border bg-surface-secondary px-3 py-1.5">
                <span className="text-xs text-muted">{language || "code"}</span>
                <button
                    type="button"
                    onClick={copy}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-success" /> Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" /> Copy
                        </>
                    )}
                </button>
            </div>

            <pre className="overflow-x-auto p-4 text-[13px] leading-6">
                <code className="font-mono text-foreground">{text}</code>
            </pre>
        </div>
    );
}

const markdownComponents: Components = {
    p: ({ children }) => (
        <p className="my-2 first:mt-0 last:mb-0 wrap-anywhere">
            {children}
        </p>
    ),
    h1: ({ children }) => (
        <h3 className="mb-2 mt-5 text-base font-semibold first:mt-0">{children}</h3>
    ),
    h2: ({ children }) => (
        <h3 className="mb-2 mt-5 text-base font-semibold first:mt-0">{children}</h3>
    ),
    h3: ({ children }) => (
        <h4 className="mb-1.5 mt-4 text-sm font-semibold first:mt-0">{children}</h4>
    ),
    h4: ({ children }) => (
        <h4 className="mb-1.5 mt-4 text-sm font-semibold first:mt-0">{children}</h4>
    ),
    strong: ({ children }) => (
        <strong className="font-semibold text-foreground">{children}</strong>
    ),
    ul: ({ children }) => (
        <ul className="my-2 list-disc space-y-1 pl-5 marker:text-muted">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-muted">
            {children}
        </ol>
    ),
    li: ({ children }) => <li className="wrap-anywhere">{children}</li>,
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
        >
            {children}
        </a>
    ),
    hr: () => <hr className="my-4 border-border" />,
    blockquote: ({ children }) => (
        <blockquote className="my-3 border-l-2 border-primary/50 pl-3 text-muted">
            {children}
        </blockquote>
    ),
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    code: ({ children }) => (
        <code className="rounded-md bg-surface-secondary px-1.5 py-0.5 font-mono text-[0.85em] wrap-anywhere">
            {children}
        </code>
    ),
    table: ({ children }) => (
        <div className="my-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="bg-surface-secondary">{children}</thead>
    ),
    th: ({ children }) => (
        <th className="whitespace-nowrap px-3 py-2 font-medium">{children}</th>
    ),
    td: ({ children }) => (
        <td className="border-t border-border px-3 py-2 align-top">{children}</td>
    ),
};

export default function MarkdownMessage({ content }: { content: string }) {
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
        </ReactMarkdown>
    );
}