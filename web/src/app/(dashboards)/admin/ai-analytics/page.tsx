"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    BrainCircuit,
    Clock3,
    Cpu,
    Database,
    Gauge,
    RefreshCw,
    Sparkles,
    Users,
} from "lucide-react";

type Range = 7 | 30 | 90;

interface AnalyticsData {
    range: number;
    overview: {
        totalRequests: number;
        totalPromptTokens: number;
        totalCompletionTokens: number;
        totalTokens: number;
        avgPromptTokens: number;
        avgCompletionTokens: number;
        avgResponseTime: number;
        avgTokensPerRequest: number;
    };
    model: {
        current: string;
        dailyThreshold: number;
        todayTokens: number;
        todayRequests: number;
        dailyUsagePercentage: number;
    };
    features: {
        feature: string;
        requests: number;
        totalTokens: number;
        promptTokens: number;
        completionTokens: number;
        avgResponseTime: number;
    }[];
    models: {
        model: string;
        requests: number;
        totalTokens: number;
        avgResponseTime: number;
    }[];
    daily: {
        date: string;
        requests: number;
        tokens: number;
        promptTokens: number;
        completionTokens: number;
        avgResponseTime: number;
    }[];
    sources: {
        source: string;
        requests: number;
        tokens: number;
    }[];
    topUsers: {
        id: string;
        username: string;
        email: string;
        role: string;
        requests: number;
        tokens: number;
        avgResponseTime: number;
    }[];
}

interface ChartPoint {
    date: string;
    label: string;
    tokens: number;
}

const numberFormat = new Intl.NumberFormat("en-IN");

function formatNumber(value: number) {
    return numberFormat.format(Math.round(value || 0));
}

function formatFeature(value: string) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseDate(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getChartPoints(daily: AnalyticsData["daily"], range: Range): ChartPoint[] {
    const usageMap = new Map(daily.map((item) => [item.date, item.tokens]));
    const today = new Date();
    const points: ChartPoint[] = [];

    for (let i = range - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setHours(0, 0, 0, 0);
        date.setDate(today.getDate() - i);

        const dateKey = toDateKey(date);
        const label =
            range === 7
                ? date.toLocaleDateString("en-IN", { weekday: "short" })
                : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

        points.push({
            date: dateKey,
            label,
            tokens: usageMap.get(dateKey) || 0,
        });
    }

    return points;
}

function formatTooltipDate(value: string) {
    return parseDate(value).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function AiAnalyticsPage() {
    const [range, setRange] = useState<Range>(30);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchAnalytics = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            setError("");

            const response = await fetch(`/api/admin/ai-analytics?range=${range}`, {
                cache: "no-store",
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to fetch AI analytics");
            }

            setData(result);
        } catch (err: any) {
            setError(err.message || "Failed to load AI analytics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [range]);

    const chartPoints = useMemo(
        () => (data ? getChartPoints(data.daily, range) : []),
        [data, range],
    );

    const maxFeatureTokens = useMemo(
        () => Math.max(...(data?.features.map((item) => item.totalTokens) || [1])),
        [data],
    );

    if (loading) {
        return (
            <main className="min-h-full bg-background p-5 md:p-8">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <RefreshCw className="h-7 w-7 animate-spin text-primary" />
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-full bg-background p-5 md:p-8">
                <div className="rounded-2xl border border-danger/30 bg-danger/5 px-5 py-4 text-danger">
                    <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5" />
                        <div>
                            <p className="font-semibold">Unable to load AI analytics</p>
                            <p className="mt-1 text-sm text-muted">{error}</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!data) return null;

    return (
        <main className="min-h-full bg-background p-5 md:p-8">
            <div className="mx-auto max-w-375 space-y-6">
                <section className="flex flex-col justify-between gap-5 border-b border-border pb-6 md:flex-row md:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-accent text-primary">
                                <BrainCircuit className="h-5 w-5" />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                AI Operations
                            </span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            AI Analytics
                        </h1>

                        <p className="mt-1 text-sm text-muted">
                            Monitor AI usage, token consumption and model performance.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex rounded-xl border border-border bg-surface p-1">
                            {[7, 30, 90].map((value) => (
                                <button
                                    key={value}
                                    onClick={() => setRange(value as Range)}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${range === value
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted hover:bg-surface-secondary hover:text-foreground"
                                        }`}
                                >
                                    {value}D
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => fetchAnalytics(true)}
                            disabled={refreshing}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={Activity}
                        label="AI Requests"
                        value={formatNumber(data.overview.totalRequests)}
                        detail={`${range} day period`}
                    />
                    <MetricCard
                        icon={Database}
                        label="Total Tokens"
                        value={formatNumber(data.overview.totalTokens)}
                        detail={`${formatNumber(data.overview.avgTokensPerRequest)} avg / request`}
                    />
                    <MetricCard
                        icon={Clock3}
                        label="Avg Response"
                        value={`${data.overview.avgResponseTime.toFixed(2)}s`}
                        detail="Across recorded requests"
                    />
                    <MetricCard
                        icon={Cpu}
                        label="Current Model"
                        value={data.model.current}
                        detail="System configuration"
                        compact
                    />
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">Token Usage</h2>
                                <p className="mt-1 text-xs text-muted">
                                    Daily token consumption · {range} day period
                                </p>
                            </div>
                            <Activity className="h-5 w-5 text-primary" />
                        </div>

                        <TokenLineChart points={chartPoints} range={range} />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">Daily Threshold</h2>
                                <p className="mt-1 text-xs text-muted">
                                    Configured token alert level
                                </p>
                            </div>
                            <Gauge className="h-5 w-5 text-warning" />
                        </div>

                        <div className="p-5">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-semibold text-foreground">
                                        {formatNumber(data.model.todayTokens)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted">tokens used today</p>
                                </div>
                                <p className="text-sm font-semibold text-primary">
                                    {data.model.dailyUsagePercentage}%
                                </p>
                            </div>

                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-secondary">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${data.model.dailyUsagePercentage}%` }}
                                />
                            </div>

                            <div className="mt-4 flex justify-between text-xs">
                                <span className="text-muted">Alert threshold</span>
                                <span className="font-medium text-foreground">
                                    {data.model.dailyThreshold
                                        ? formatNumber(data.model.dailyThreshold)
                                        : "Not configured"}
                                </span>
                            </div>

                            <div className="mt-5 border-t border-border pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Requests today</span>
                                    <span className="font-medium text-foreground">
                                        {formatNumber(data.model.todayRequests)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">Usage by Feature</h2>
                                <p className="mt-1 text-xs text-muted">
                                    Where AI tokens are being consumed
                                </p>
                            </div>
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>

                        <div className="divide-y divide-border">
                            {data.features.length === 0 ? (
                                <EmptyState text="No feature usage available." />
                            ) : (
                                data.features.map((item) => (
                                    <div key={item.feature} className="px-5 py-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {formatFeature(item.feature)}
                                                </p>
                                                <p className="mt-1 text-xs text-muted">
                                                    {formatNumber(item.requests)} requests ·{" "}
                                                    {item.avgResponseTime.toFixed(2)}s avg
                                                </p>
                                            </div>

                                            <span className="shrink-0 text-sm font-semibold text-foreground">
                                                {formatNumber(item.totalTokens)}
                                            </span>
                                        </div>

                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-secondary">
                                            <div
                                                className="h-full rounded-full bg-primary/70"
                                                style={{
                                                    width: `${Math.max(
                                                        (item.totalTokens / maxFeatureTokens) * 100,
                                                        2,
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">Model Usage</h2>
                                <p className="mt-1 text-xs text-muted">
                                    Token consumption by AI model
                                </p>
                            </div>
                            <Cpu className="h-5 w-5 text-primary" />
                        </div>

                        <div className="divide-y divide-border">
                            {data.models.length === 0 ? (
                                <EmptyState text="No model usage available." />
                            ) : (
                                data.models.map((item) => (
                                    <div
                                        key={item.model}
                                        className="flex items-center justify-between gap-4 px-5 py-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-sm text-foreground">
                                                {item.model}
                                            </p>
                                            <p className="mt-1 text-xs text-muted">
                                                {formatNumber(item.requests)} requests ·{" "}
                                                {item.avgResponseTime.toFixed(2)}s avg
                                            </p>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold text-foreground">
                                                {formatNumber(item.totalTokens)}
                                            </p>
                                            <p className="mt-1 text-[11px] text-muted">tokens</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.5fr]">
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">Usage Source</h2>
                                <p className="mt-1 text-xs text-muted">
                                    Subscription and quota usage
                                </p>
                            </div>
                            <Database className="h-5 w-5 text-primary" />
                        </div>

                        <div className="divide-y divide-border">
                            {data.sources.length === 0 ? (
                                <EmptyState text="No source data available." />
                            ) : (
                                data.sources.map((item) => (
                                    <div
                                        key={item.source}
                                        className="flex items-center justify-between px-5 py-4"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {item.source}
                                            </p>
                                            <p className="mt-1 text-xs text-muted">
                                                {formatNumber(item.requests)} requests
                                            </p>
                                        </div>

                                        <span className="text-sm font-semibold text-foreground">
                                            {formatNumber(item.tokens)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-foreground">Top AI Consumers</h2>
                                <p className="mt-1 text-xs text-muted">
                                    Users with the highest token consumption
                                </p>
                            </div>
                            <Users className="h-5 w-5 text-primary" />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted">
                                        <th className="px-5 py-3 font-medium">User</th>
                                        <th className="px-5 py-3 font-medium">Role</th>
                                        <th className="px-5 py-3 text-right font-medium">Requests</th>
                                        <th className="px-5 py-3 text-right font-medium">Tokens</th>
                                        <th className="px-5 py-3 text-right font-medium">Avg</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.topUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted">
                                                No user usage available.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.topUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b border-border last:border-0 hover:bg-surface-secondary"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {user.username}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-muted">
                                                        {user.email}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 text-xs capitalize text-muted">
                                                    {user.role.replace(/_/g, " ")}
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm text-foreground">
                                                    {formatNumber(user.requests)}
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm font-medium text-foreground">
                                                    {formatNumber(user.tokens)}
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm text-muted">
                                                    {user.avgResponseTime.toFixed(2)}s
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-foreground">Token Breakdown</h2>
                            <p className="mt-1 text-xs text-muted">
                                Prompt and completion token distribution
                            </p>
                        </div>
                        <Activity className="h-5 w-5 text-primary" />
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
                        <BreakdownItem label="Prompt Tokens" value={data.overview.totalPromptTokens} />
                        <BreakdownItem
                            label="Completion Tokens"
                            value={data.overview.totalCompletionTokens}
                        />
                        <BreakdownItem
                            label="Average / Request"
                            value={data.overview.avgTokensPerRequest}
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}

function TokenLineChart({ points, range }: { points: ChartPoint[]; range: Range }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const width = 900;
    const height = 300;
    const left = 58;
    const right = 20;
    const top = 25;
    const bottom = 48;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const maxTokens = Math.max(...points.map((point) => point.tokens), 1);
    const gridValues = [0, 0.25, 0.5, 0.75, 1];

    const coordinates = points.map((point, index) => {
        const x =
            points.length === 1
                ? left + chartWidth / 2
                : left + (index / (points.length - 1)) * chartWidth;
        const y = top + chartHeight - (point.tokens / maxTokens) * chartHeight;

        return { ...point, x, y };
    });

    const linePath = coordinates
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" ");

    const areaPath = `${linePath} L ${coordinates[coordinates.length - 1]?.x || left
        } ${top + chartHeight} L ${coordinates[0]?.x || left} ${top + chartHeight} Z`;

    const visibleLabelIndexes =
        range === 7
            ? points.map((_, index) => index)
            : points.length <= 10
                ? points.map((_, index) => index)
                : points
                    .map((_, index) => index)
                    .filter(
                        (index) =>
                            index === 0 ||
                            index === points.length - 1 ||
                            index % Math.ceil(points.length / 6) === 0,
                    );

    return (
        <div className="p-4 md:p-5">
            {points.length === 0 ? (
                <EmptyState text="No AI usage recorded for this period." />
            ) : (
                <div className="relative">
                    <div className="overflow-x-auto">
                        <svg
                            viewBox={`0 0 ${width} ${height}`}
                            className="h-70 min-w-175 w-full"
                        >
                            {gridValues.map((value) => {
                                const y = top + chartHeight - value * chartHeight;
                                const tokenValue = Math.round(maxTokens * value);

                                return (
                                    <g key={value}>
                                        <line
                                            x1={left}
                                            x2={width - right}
                                            y1={y}
                                            y2={y}
                                            stroke="var(--border)"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={left - 10}
                                            y={y + 4}
                                            textAnchor="end"
                                            fontSize="10"
                                            fill="var(--muted)"
                                        >
                                            {formatNumber(tokenValue)}
                                        </text>
                                    </g>
                                );
                            })}

                            <path d={areaPath} fill="var(--accent)" opacity="0.25" />

                            <path
                                d={linePath}
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {coordinates.map((point, index) => (
                                <g key={point.date}>
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r={hoveredIndex === index ? 5 : 3.5}
                                        fill="var(--background)"
                                        stroke="var(--primary)"
                                        strokeWidth="2"
                                        className="cursor-pointer transition-all"
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    />

                                    <rect
                                        x={point.x - 18}
                                        y={top}
                                        width="36"
                                        height={chartHeight}
                                        fill="transparent"
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    />
                                </g>
                            ))}

                            {visibleLabelIndexes.map((index) => {
                                const point = coordinates[index];

                                return (
                                    <text
                                        key={`${point.date}-label`}
                                        x={point.x}
                                        y={height - 15}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fill="var(--muted)"
                                    >
                                        {point.label}
                                    </text>
                                );
                            })}
                        </svg>
                    </div>

                    {hoveredIndex !== null && coordinates[hoveredIndex] && (
                        <div
                            className="pointer-events-none absolute z-10 rounded-xl border border-border bg-surface px-3 py-2 shadow-sm"
                            style={{
                                left: `${Math.min(
                                    Math.max(
                                        (coordinates[hoveredIndex].x / width) * 100,
                                        8,
                                    ),
                                    82,
                                )}%`,
                                top: "12%",
                                transform: "translateX(-50%)",
                            }}
                        >
                            <p className="whitespace-nowrap text-xs font-medium text-foreground">
                                {formatTooltipDate(coordinates[hoveredIndex].date)}
                            </p>
                            <p className="mt-1 whitespace-nowrap text-sm font-semibold text-primary">
                                {formatNumber(coordinates[hoveredIndex].tokens)} tokens
                            </p>
                        </div>
                    )}

                    <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-[11px] text-muted">{points.length} days</span>
                        <span className="flex items-center gap-2 text-[11px] text-muted">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            Tokens used
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    detail,
    compact = false,
}: {
    icon: typeof Activity;
    label: string;
    value: string;
    detail: string;
    compact?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-border bg-surface px-5 py-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-accent text-primary">
                    <Icon className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                    {label}
                </span>
            </div>

            <p
                className={`mt-5 truncate font-semibold text-foreground ${compact ? "font-mono text-base" : "text-2xl"
                    }`}
            >
                {value}
            </p>

            <p className="mt-1 text-xs text-muted">{detail}</p>
        </div>
    );
}

function BreakdownItem({ label, value }: { label: string; value: number }) {
    return (
        <div className="px-5 py-5">
            <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
                {formatNumber(value)}
            </p>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return <div className="px-5 py-10 text-center text-sm text-muted">{text}</div>;
}