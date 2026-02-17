import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
    Shield,
    ArrowLeft,
    ScanSearch,
    Trash2,
    Filter,
    Download,
} from "lucide-react";

interface ScanRow {
    id: string;
    verdict: string;
    confidence: number;
    detection_data: Record<string, unknown>;
    watermark_data: Record<string, unknown>;
    image_quality: Record<string, unknown>;
    reasons: string[];
    processing_time_ms: number;
    image_name: string | null;
    created_at: string;
}

const History = () => {
    const { user } = useAuth();
    const [scans, setScans] = useState<ScanRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterVerdict, setFilterVerdict] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        fetchScans();
    }, [user, filterVerdict]);

    const fetchScans = async () => {
        let query = supabase
            .from("scans")
            .select("*")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false });

        if (filterVerdict) {
            query = query.eq("verdict", filterVerdict);
        }

        const { data } = await query;
        setScans(data || []);
        setLoading(false);
    };

    const deleteScan = async (id: string) => {
        await supabase.from("scans").delete().eq("id", id);
        setScans(scans.filter((s) => s.id !== id));
    };

    const exportCSV = () => {
        const headers = ["Date", "Verdict", "Confidence", "Processing Time (ms)", "Image Name"];
        const rows = scans.map((s) => [
            new Date(s.created_at).toISOString(),
            s.verdict,
            (s.confidence * 100).toFixed(1) + "%",
            s.processing_time_ms,
            s.image_name || "",
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `deepguard-history-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    const verdictConfig: Record<string, { label: string; className: string }> = {
        VERIFIED_AI: { label: "DEEPFAKE", className: "bg-chart-1/10 text-chart-1 border-chart-1" },
        VERIFIED_REAL: { label: "REAL", className: "bg-chart-2/10 text-chart-2 border-chart-2" },
        UNVERIFIED: { label: "UNKNOWN", className: "bg-chart-4/10 text-chart-4 border-chart-4" },
    };

    const verdictFilters = [
        { label: "All", value: null },
        { label: "Deepfake", value: "VERIFIED_AI" },
        { label: "Real", value: "VERIFIED_REAL" },
        { label: "Unknown", value: "UNVERIFIED" },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <section className="border-b-4 border-foreground bg-muted">
                <div className="container py-12">
                    <Link
                        to="/dashboard"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold uppercase tracking-tight">
                                Scan History
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {scans.length} scan{scans.length !== 1 ? "s" : ""} total
                            </p>
                        </div>
                        <Button variant="outline" onClick={exportCSV} disabled={scans.length === 0} className="gap-2">
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        {verdictFilters.map(({ label, value }) => (
                            <button
                                key={label}
                                onClick={() => { setFilterVerdict(value); setLoading(true); }}
                                className={`border-2 border-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${filterVerdict === value
                                        ? "bg-foreground text-background"
                                        : "bg-background hover:bg-accent"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Scan List */}
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 animate-pulse border-4 border-foreground/20 bg-accent" />
                            ))}
                        </div>
                    ) : scans.length === 0 ? (
                        <div className="border-4 border-dashed border-foreground/30 p-12 text-center">
                            <ScanSearch className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 font-bold uppercase text-muted-foreground">
                                {filterVerdict ? "No scans match this filter" : "No scans yet"}
                            </p>
                            <Link to="/deepfake" className="mt-4 inline-block">
                                <Button className="gap-2">
                                    <ScanSearch className="h-4 w-4" />
                                    Start Scanning
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {scans.map((scan) => {
                                const config = verdictConfig[scan.verdict] || verdictConfig.UNVERIFIED;
                                const isExpanded = expandedId === scan.id;
                                return (
                                    <div key={scan.id} className="border-4 border-foreground bg-card shadow-sm">
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : scan.id)}
                                            className="flex w-full items-center justify-between p-4 text-left hover:bg-accent/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`border-2 px-2 py-0.5 text-xs font-bold uppercase ${config.className}`}>
                                                    {config.label}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-bold">
                                                        {scan.image_name || "Uploaded Image"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(scan.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-mono text-sm font-bold">
                                                        {Math.round(scan.confidence * 100)}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {scan.processing_time_ms}ms
                                                    </p>
                                                </div>
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="border-t-2 border-foreground p-4">
                                                {/* Reasons */}
                                                <h4 className="mb-2 text-sm font-bold uppercase">Analysis</h4>
                                                <ul className="mb-4 space-y-1">
                                                    {scan.reasons.map((reason, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm">
                                                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-foreground bg-accent font-mono text-[10px] font-bold">
                                                                {i + 1}
                                                            </span>
                                                            {reason}
                                                        </li>
                                                    ))}
                                                </ul>

                                                {/* Model Info */}
                                                <div className="mb-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                                                    <div className="border-2 border-foreground p-2">
                                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Model</p>
                                                        <p className="font-mono text-xs">{(scan.detection_data as Record<string, string>).model_name || "ViT-v2"}</p>
                                                    </div>
                                                    <div className="border-2 border-foreground p-2">
                                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Score</p>
                                                        <p className="font-mono text-xs">{Number((scan.detection_data as Record<string, number>).score || 0).toFixed(3)}</p>
                                                    </div>
                                                    <div className="border-2 border-foreground p-2">
                                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Label</p>
                                                        <p className="font-mono text-xs">{(scan.detection_data as Record<string, string>).label || "—"}</p>
                                                    </div>
                                                    <div className="border-2 border-foreground p-2">
                                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Time</p>
                                                        <p className="font-mono text-xs">{scan.processing_time_ms}ms</p>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                    onClick={(e) => { e.stopPropagation(); deleteScan(scan.id); }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <footer className="border-t-4 border-foreground bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold uppercase tracking-wider">DeepGuard AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">© 2026 DeepGuard AI.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default History;
