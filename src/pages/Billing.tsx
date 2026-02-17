import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import {
    Shield,
    ArrowLeft,
    CreditCard,
    TrendingUp,
    Calendar,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Zap,
    Rocket,
    Building2,
    Crown,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLAN_CONFIG: Record<string, { icon: any; scans: number; label: string; color: string }> = {
    free: { icon: Zap, scans: 50, label: "Free", color: "text-muted-foreground" },
    pro: { icon: Rocket, scans: 1000, label: "Pro", color: "text-chart-2" },
    business: { icon: Building2, scans: 10000, label: "Business", color: "text-chart-4" },
    enterprise: { icon: Crown, scans: -1, label: "Enterprise", color: "text-chart-5" },
};

const Billing = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const location = useLocation();
    const [plan, setPlan] = useState("free");
    const [status, setStatus] = useState("active");
    const [periodEnd, setPeriodEnd] = useState<string | null>(null);
    const [scanCount, setScanCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradePlan, setUpgradePlan] = useState("");

    useEffect(() => {
        if (!user) return;
        loadBillingData();
        // Check if redirected from pricing page
        const state = location.state as { upgradeTo?: string } | null;
        if (state?.upgradeTo && state.upgradeTo !== plan) {
            setUpgradePlan(state.upgradeTo);
            setShowUpgradeModal(true);
        }
    }, [user]);

    const loadBillingData = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            // load subscription
            const { data: sub } = await supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (sub) {
                setPlan(sub.plan);
                setStatus(sub.status);
                setPeriodEnd(sub.current_period_end);
            }

            // load usage
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const { data: usage } = await supabase
                .from("usage_logs")
                .select("scan_count")
                .eq("user_id", user.id)
                .gte("period_start", monthStart.toISOString())
                .single();

            if (usage) {
                setScanCount(usage.scan_count);
            }
        } catch {
            // defaults are fine
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgrade = async (targetPlan: string) => {
        if (!user) return;

        try {
            // Upsert subscription
            const { error } = await supabase
                .from("subscriptions")
                .upsert({
                    user_id: user.id,
                    plan: targetPlan,
                    status: "active",
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                }, { onConflict: "user_id" });

            if (error) throw error;

            setPlan(targetPlan);
            setShowUpgradeModal(false);

            toast({
                title: "Plan Updated!",
                description: `You've been upgraded to ${PLAN_CONFIG[targetPlan]?.label || targetPlan}.`,
            });
        } catch (err) {
            toast({
                title: "Upgrade Failed",
                description: "Could not update plan. Please try again.",
                variant: "destructive",
            });
        }
    };

    const config = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
    const PlanIcon = config.icon;
    const scanLimit = config.scans;
    const usagePercent = scanLimit > 0 ? Math.min((scanCount / scanLimit) * 100, 100) : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container flex items-center justify-center py-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <section className="border-b-4 border-foreground bg-muted">
                <div className="container py-12 md:py-16">
                    <Link
                        to="/dashboard"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <h1 className="text-4xl font-bold uppercase leading-tight tracking-tight md:text-5xl mb-2">
                        Billing & <span className="text-muted-foreground">Usage</span>
                    </h1>

                    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Current Plan */}
                        <div className="border-4 border-foreground bg-card p-6 shadow-md">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                <CreditCard className="h-4 w-4" />
                                Current Plan
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <PlanIcon className={cn("h-8 w-8", config.color)} />
                                <div>
                                    <h2 className={cn("text-2xl font-bold uppercase", config.color)}>{config.label}</h2>
                                    <span
                                        className={cn(
                                            "inline-block border px-2 py-0.5 text-[10px] font-bold uppercase mt-1",
                                            status === "active"
                                                ? "border-chart-2 text-chart-2 bg-chart-2/10"
                                                : "border-chart-1 text-chart-1 bg-chart-1/10"
                                        )}
                                    >
                                        {status}
                                    </span>
                                </div>
                            </div>
                            {periodEnd && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Renews {new Date(periodEnd).toLocaleDateString()}
                                </div>
                            )}
                            <div className="mt-4 flex gap-2">
                                <Link to="/pricing">
                                    <Button variant="outline" size="sm" className="font-bold uppercase text-xs">
                                        {plan === "free" ? "Upgrade" : "Change Plan"}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Usage Meter */}
                        <div className="border-4 border-foreground bg-card p-6 shadow-md">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                <TrendingUp className="h-4 w-4" />
                                Usage This Month
                            </div>
                            <div className="mb-3">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-3xl font-bold font-mono">{scanCount}</span>
                                    <span className="text-sm text-muted-foreground font-mono">
                                        / {scanLimit === -1 ? "∞" : scanLimit.toLocaleString()} scans
                                    </span>
                                </div>
                            </div>
                            {scanLimit > 0 && (
                                <>
                                    <div className="h-4 w-full border-2 border-foreground bg-muted overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-500",
                                                usagePercent >= 90
                                                    ? "bg-chart-1"
                                                    : usagePercent >= 70
                                                        ? "bg-chart-4"
                                                        : "bg-chart-2"
                                            )}
                                            style={{ width: `${usagePercent}%` }}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {usagePercent >= 90 ? (
                                            <span className="flex items-center gap-1 text-chart-1 font-bold">
                                                <AlertTriangle className="h-3 w-3" />
                                                {usagePercent >= 100 ? "Limit reached!" : "Almost at limit!"}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3 text-chart-2" />
                                                {Math.round(100 - usagePercent)}% remaining
                                            </span>
                                        )}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="border-4 border-foreground bg-card p-6 shadow-md">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                <Shield className="h-4 w-4" />
                                Plan Features
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                    {plan === "free"
                                        ? "ViT Detection Model"
                                        : "All Detection Models"}
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                    {plan === "free" ? "30-day history" : "Unlimited history"}
                                </li>
                                {plan !== "free" && (
                                    <>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                            Attention heatmaps
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                            Batch processing
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                            Forensics toolkit
                                        </li>
                                    </>
                                )}
                                {(plan === "business" || plan === "enterprise") && (
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                        Priority support
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Invoice History */}
                    <div className="mt-8 border-4 border-foreground bg-card shadow-md">
                        <div className="border-b-2 border-foreground p-4">
                            <h3 className="text-lg font-bold uppercase">Invoice History</h3>
                        </div>
                        <div className="p-8 text-center text-muted-foreground">
                            <CreditCard className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p className="font-bold uppercase text-sm">No invoices yet</p>
                            <p className="text-xs mt-1">Invoices will appear here once you subscribe to a paid plan.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
                    <div className="w-full max-w-md border-4 border-foreground bg-card p-8 shadow-lg">
                        <h2 className="text-2xl font-bold uppercase mb-2">Confirm Upgrade</h2>
                        <p className="text-muted-foreground mb-6">
                            Upgrade to{" "}
                            <strong className="text-foreground">
                                {PLAN_CONFIG[upgradePlan]?.label || upgradePlan}
                            </strong>
                            ? Your new plan takes effect immediately.
                        </p>
                        <div className="border-2 border-dashed border-foreground/30 bg-muted/50 p-4 mb-6 text-sm">
                            <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">Plan</span>
                                <span className="font-bold">{PLAN_CONFIG[upgradePlan]?.label}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">Scan Limit</span>
                                <span className="font-mono font-bold">
                                    {(PLAN_CONFIG[upgradePlan]?.scans || 0).toLocaleString()}/mo
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Next Billing</span>
                                <span className="font-mono text-xs">
                                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 font-bold uppercase"
                                onClick={() => setShowUpgradeModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 font-bold uppercase"
                                onClick={() => handleUpgrade(upgradePlan)}
                            >
                                Confirm Upgrade
                            </Button>
                        </div>
                        <p className="mt-3 text-center text-[10px] text-muted-foreground uppercase">
                            Stripe checkout integration coming soon
                        </p>
                    </div>
                </div>
            )}

            <footer className="border-t-4 border-foreground bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold uppercase tracking-wider">DeepGuard AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">© 2026 DeepGuard AI</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Billing;
