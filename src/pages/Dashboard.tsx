import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { FadeIn } from "@/components/Animations";
import {
    Shield,
    ScanSearch,
    Cpu,
    CheckCircle2,
    AlertTriangle,
    Key,
    ArrowRight,
    History,
    CreditCard,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanRow {
    id: string;
    verdict: string;
    confidence: number;
    processing_time_ms: number;
    image_name: string | null;
    created_at: string;
}

interface Stats {
    totalScans: number;
    deepfakes: number;
    realImages: number;
    apiKeys: number;
}

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({ totalScans: 0, deepfakes: 0, realImages: 0, apiKeys: 0 });
    const [recentScans, setRecentScans] = useState<ScanRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState("free");
    const [scanCount, setScanCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            // Fetch scans
            const { data: scans } = await supabase
                .from("scans")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(5);

            // Fetch API keys count
            const { count: keyCount } = await supabase
                .from("api_keys")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            const scanList = scans || [];
            setRecentScans(scanList);

            // Get all scans for stats
            const { count: totalCount } = await supabase
                .from("scans")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            const { count: fakeCount } = await supabase
                .from("scans")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("verdict", "VERIFIED_AI");

            const { count: realCount } = await supabase
                .from("scans")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("verdict", "VERIFIED_REAL");

            setStats({
                totalScans: totalCount || 0,
                deepfakes: fakeCount || 0,
                realImages: realCount || 0,
                apiKeys: keyCount || 0,
            });

            // Fetch subscription
            const { data: sub } = await supabase
                .from("subscriptions")
                .select("plan")
                .eq("user_id", user.id)
                .single();
            if (sub) setPlan(sub.plan);

            // Fetch usage
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);
            const { data: usage } = await supabase
                .from("usage_logs")
                .select("scan_count")
                .eq("user_id", user.id)
                .gte("period_start", monthStart.toISOString())
                .single();
            if (usage) setScanCount(usage.scan_count);

            setLoading(false);
        };

        fetchData();
    }, [user]);

    const verdictConfig: Record<string, { label: string; className: string }> = {
        VERIFIED_AI: { label: "DEEPFAKE", className: "bg-chart-1/10 text-chart-1 border-chart-1" },
        VERIFIED_REAL: { label: "REAL", className: "bg-chart-2/10 text-chart-2 border-chart-2" },
        UNVERIFIED: { label: "UNKNOWN", className: "bg-chart-4/10 text-chart-4 border-chart-4" },
    };

    const statCards = [
        { label: "Total Scans", value: stats.totalScans, icon: ScanSearch },
        { label: "Deepfakes Found", value: stats.deepfakes, icon: AlertTriangle },
        { label: "Verified Real", value: stats.realImages, icon: CheckCircle2 },
        { label: "API Keys", value: stats.apiKeys, icon: Key },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <section className="border-b-4 border-foreground bg-muted">
                <div className="container py-12">
                    {/* Welcome + Plan Badge */}
                    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold uppercase tracking-tight">
                                Dashboard
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Welcome back, {user?.user_metadata?.full_name || user?.email}
                            </p>
                        </div>
                        <Link to="/dashboard/billing">
                            <div className="flex items-center gap-3 border-4 border-foreground bg-card px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                                <Zap className="h-5 w-5" />
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan</div>
                                    <div className="font-bold uppercase">{plan}</div>
                                </div>
                                <div className="ml-4 w-20">
                                    <div className="h-2 w-full border border-foreground bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-chart-2 transition-all"
                                            style={{ width: `${plan === "enterprise" ? 100 : Math.min((scanCount / (plan === "business" ? 10000 : plan === "pro" ? 1000 : 50)) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-muted-foreground font-mono">
                                        {scanCount}/{plan === "enterprise" ? "∞" : plan === "business" ? "10K" : plan === "pro" ? "1K" : "50"}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map(({ label, value, icon: Icon }) => (
                            <div
                                key={label}
                                className="border-4 border-foreground bg-card p-6 shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="border-2 border-foreground bg-accent p-2 shadow-xs">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-mono text-3xl font-bold">
                                        {loading ? "—" : value}
                                    </span>
                                </div>
                                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-b-4 border-foreground">
                <div className="container py-12">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Recent Scans */}
                        <div className="lg:col-span-2">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold uppercase tracking-wide">
                                    Recent Scans
                                </h2>
                                <Link to="/dashboard/history">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <History className="h-4 w-4" />
                                        View All
                                    </Button>
                                </Link>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 animate-pulse border-4 border-foreground/20 bg-accent" />
                                    ))}
                                </div>
                            ) : recentScans.length === 0 ? (
                                <div className="border-4 border-dashed border-foreground/30 p-8 text-center">
                                    <ScanSearch className="mx-auto h-10 w-10 text-muted-foreground" />
                                    <p className="mt-3 font-bold uppercase text-muted-foreground">
                                        No scans yet
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Start scanning images to see results here.
                                    </p>
                                    <Link to="/deepfake" className="mt-4 inline-block">
                                        <Button className="gap-2">
                                            <ScanSearch className="h-4 w-4" />
                                            Scan Now
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentScans.map((scan) => {
                                        const config = verdictConfig[scan.verdict] || verdictConfig.UNVERIFIED;
                                        return (
                                            <div
                                                key={scan.id}
                                                className="flex items-center justify-between border-4 border-foreground bg-card p-4 shadow-sm"
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
                                                <div className="text-right">
                                                    <p className="font-mono text-sm font-bold">
                                                        {Math.round(scan.confidence * 100)}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {scan.processing_time_ms}ms
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="mb-4 text-xl font-bold uppercase tracking-wide">
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                <Link to="/deepfake" className="block">
                                    <div className="flex items-center justify-between border-4 border-foreground bg-card p-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="border-2 border-foreground bg-accent p-2 shadow-xs">
                                                <ScanSearch className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold uppercase text-sm">New Scan</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </Link>
                                <Link to="/dashboard/api-keys" className="block">
                                    <div className="flex items-center justify-between border-4 border-foreground bg-card p-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="border-2 border-foreground bg-accent p-2 shadow-xs">
                                                <Key className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold uppercase text-sm">API Keys</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </Link>
                                <Link to="/dashboard/history" className="block">
                                    <div className="flex items-center justify-between border-4 border-foreground bg-card p-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="border-2 border-foreground bg-accent p-2 shadow-xs">
                                                <History className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold uppercase text-sm">Scan History</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </Link>
                                <Link to="/dashboard/billing" className="block">
                                    <div className="flex items-center justify-between border-4 border-foreground bg-card p-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="border-2 border-foreground bg-accent p-2 shadow-xs">
                                                <CreditCard className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold uppercase text-sm">Billing</span>
                                        </div>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t-4 border-foreground bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold uppercase tracking-wider">DeepGuard AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2026 DeepGuard AI. Powered by Vision Transformer.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
