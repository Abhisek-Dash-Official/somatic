"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MessageSquare, MoreHorizontal, Pencil, Plus, Search, Sparkles, Trash2, X, Languages } from "lucide-react";
import { navLinks } from "@/config/nav";

const iconMap = { MessageSquare, Languages };

type Conversation = { _id: string; title: string; summary: string; last_message_at: string; created_at: string };
type Props = {
    open: boolean;
    onClose: () => void;
    conversations: Conversation[];
    loading: boolean;
    activeId: string | null;
    activeTab: string;
    isStreaming: boolean;
    onNew: () => void;
    onSelect: (id: string) => void;
    onRename: (id: string, title: string) => Promise<void>;
    onDelete: (id: string) => void;
};

const formatConversationDate = (date: string) => {
    const now = new Date();
    const day = 86400000;
    const t = new Date(date).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return t >= today ? "Today" : t >= today - day ? "Yesterday" : t >= today - 7 * day ? "Previous 7 days" : "Older";
};

export default function ChatSidebar({ open, onClose, conversations, loading, activeId, activeTab, isStreaming, onNew, onSelect, onRename, onDelete }: Props) {
    const [query, setQuery] = useState("");
    const [menuId, setMenuId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!menuId) return;
        const close = () => setMenuId(null);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [menuId]);

    const groups = useMemo(() => {
        const q = query.trim().toLowerCase();
        const map: Record<string, Conversation[]> = { Today: [], Yesterday: [], "Previous 7 days": [], Older: [] };
        conversations.filter((c) => c.title.toLowerCase().includes(q)).forEach((c) => map[formatConversationDate(c.last_message_at)].push(c));
        return Object.entries(map).filter(([, items]) => items.length);
    }, [conversations, query]);

    const save = (id: string) => {
        const value = title.trim();
        if (value) onRename(id, value).then(() => setEditId(null));
    };

    return (
        <>
            {open && <button type="button" aria-label="Close sidebar"
                onClick={onClose} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}

            <aside className={`fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-[320px] flex-col border-r border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl transition-transform duration-300 lg:static lg:z-auto lg:w-70 lg:max-w-none lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-14 shrink-0 items-center justify-between px-4 pt-[env(safe-area-inset-top)] lg:h-16 lg:pt-0">
                    <Link href="/chat" onClick={onClose} className="flex min-w-0 items-center gap-2.5">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-surface-secondary ring-1 ring-border"><Image src="/soma-ai.png" alt="SOMA AI" fill sizes="36px" className="object-cover" /></div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5"><span className="truncate text-sm font-semibold">SOMA AI</span><Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" /></div>
                            <p className="truncate text-[11px] text-muted">Healthcare assistant</p>
                        </div>
                    </Link>
                    <button type="button" onClick={onClose} aria-label="Close sidebar" className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-secondary hover:text-foreground lg:hidden"><X className="h-5 w-5" /></button>
                </div>

                <div className="space-y-1 p-3">
                    <Link href="/chat" onClick={(e) => { if (isStreaming) e.preventDefault(); else onNew(); }} className={`mb-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover active:scale-[0.98] ${isStreaming ? "pointer-events-none opacity-50" : ""}`}><Plus className="h-4 w-4" />New chat</Link>

                    {navLinks.somaAiNav.map((item) => {
                        const Icon = iconMap[item.icon as keyof typeof iconMap];
                        return <Link key={item.id} href={item.href} onClick={onClose} className={`flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm transition-colors ${activeTab === item.id ? "bg-surface-secondary font-medium text-foreground" : "text-muted hover:bg-surface-secondary hover:text-foreground"}`}><Icon className="h-4 w-4" />{item.title}</Link>;
                    })}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border">
                    <div className="p-3">
                        <div className="relative mb-3">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-base text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary/50 sm:text-xs" />
                        </div>

                        {loading ? (
                            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-secondary" />)}</div>
                        ) : groups.length ? (
                            <div className="space-y-4">
                                {groups.map(([group, items]) => (
                                    <section key={group}>
                                        <h2 className="mb-1 px-2 text-[11px] font-medium text-muted">{group}</h2>
                                        <div className="space-y-0.5">
                                            {items.map((c) => (
                                                <div key={c._id} className={`group relative flex min-w-0 items-center rounded-lg ${activeId === c._id ? "bg-primary/10" : "hover:bg-surface-secondary"}`}>
                                                    {editId === c._id ? (
                                                        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => setEditId(null)} onKeyDown={(e) => { if (e.key === "Enter") save(c._id); if (e.key === "Escape") setEditId(null); }} className="h-10 min-w-0 flex-1 bg-transparent px-3 text-base text-foreground outline-none sm:text-xs" />
                                                    ) : (
                                                        <>
                                                            <button type="button" title={c.title} onClick={() => onSelect(c._id)} className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-[13px] text-foreground sm:text-xs">{c.title}</button>
                                                            <button type="button" aria-label="Conversation options" onClick={(e) => { e.stopPropagation(); setMenuId((cur) => cur === c._id ? null : c._id); }} className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground lg:opacity-0 lg:group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></button>
                                                        </>
                                                    )}

                                                    {menuId === c._id && (
                                                        <div onClick={(e) => e.stopPropagation()} className="absolute right-1 top-full z-20 mt-1 w-40 rounded-xl border border-border bg-surface p-1 shadow-lg">
                                                            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setEditId(c._id); setTitle(c.title); setMenuId(null); }} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-foreground hover:bg-surface-secondary sm:h-9 sm:text-xs"><Pencil className="h-3.5 w-3.5" />Rename</button>
                                                            <button type="button" onClick={() => { setMenuId(null); onDelete(c._id); }} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-danger hover:bg-danger/10 sm:h-9 sm:text-xs"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        ) : (
                            <div className="px-2 py-10 text-center">
                                <MessageSquare className="mx-auto h-5 w-5 text-muted" />
                                <p className="mt-2 text-xs font-medium text-foreground">{query ? "No chats found" : "No conversations yet"}</p>
                                <p className="mt-1 text-[11px] leading-4 text-muted">{query ? "Try a different word." : "Start a new chat and it will show up here."}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="shrink-0 border-t border-border p-3">
                    <Link href="/" onClick={onClose} className="flex h-10 items-center gap-2.5 rounded-lg px-3 text-xs text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"><ChevronLeft className="h-4 w-4" />Back to SOMATIC</Link>
                </div>
            </aside>
        </>
    );
}