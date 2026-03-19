import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import {
    Shield,
    Check,
    X,
    Zap,
    Building2,
    Rocket,
    Crown,
    ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        period: "forever",
        icon: Zap,
        description: "For casual users and exploration",
        scans: 50,
        apiKeys: 1,
        features: [
            { name: "ViT detection model", included: true },
            { name: "30-day scan history", included: true },
            { name: "Basic reports", included: true },
            { name: "All models & ensemble", included: false },
            { name: "Batch processing", included: false },
            { name: "Heatmap visualization", included: false },
            { name: "Forensics toolkit", included: false },
            { name: "Priority support", included: false },
        ],
        cta: "Get Started",
        highlighted: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: "$19",
        period: "/month",
        icon: Rocket,
        description: "For professionals and researchers",
        scans: 1000,
        apiKeys: 5,
        features: [
            { name: "All detection models", included: true },
            { name: "Unlimited history", included: true },
            { name: "Attention heatmaps", included: true },
            { name: "Ensemble mode", included: true },
            { name: "Batch processing (20 images)", included: true },
            { name: "Forensics toolkit", included: true },
            { name: "CSV/JSON export", included: true },
            { name: "Priority support", included: false },
        ],
        cta: "Upgrade to Pro",
        highlighted: true,
    },
    {
        id: "business",
        name: "Business",
        price: "$79",
        period: "/month",
        icon: Building2,
        description: "For teams and organizations",
        scans: 10000,
        apiKeys: 20,
        features: [
            { name: "Everything in Pro", included: true },
            { name: "Video detection", included: true },
            { name: "Webhook integrations", included: true },
            { name: "Team collaboration", included: true },
            { name: "Audit log", included: true },
            { name: "Priority queue", included: true },
            { name: "Priority support", included: true },
            { name: "SLA guarantee", included: false },
        ],
        cta: "Upgrade to Business",
        highlighted: false,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        period: "",
        icon: Crown,
        description: "For large-scale deployments",
        scans: -1,
        apiKeys: -1,
        features: [
            { name: "Everything in Business", included: true },
            { name: "Unlimited scans", included: true },
            { name: "Unlimited API keys", included: true },
            { name: "Custom models", included: true },
            { name: "On-premise deployment", included: true },
            { name: "Dedicated support", included: true },
            { name: "SLA guarantee", included: true },
            { name: "Custom integrations", included: true },
        ],
        cta: "Contact Sales",
        highlighted: false,
    },
];

const FAQ = [
    {
        q: "Can I switch plans anytime?",
        a: "Yes! You can upgrade or downgrade at any time. Changes take effect immediately and billing is prorated.",
    },
    {
        q: "What happens when I hit my scan limit?",
        a: "You'll see a warning at 80% usage. At 100%, scans will be queued until your next billing cycle or you upgrade.",
    },
    {
        q: "Is there a free trial for Pro?",
        a: "Yes, Pro comes with a 14-day free trial. No credit card required to start.",
    },
    {
        q: "How does batch processing work?",
        a: "Upload up to 20 images at once. Each image counts as one scan towards your monthly limit.",
    },
];

const Pricing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentPlan, setCurrentPlan] = useState("free");
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        if (user) {
            supabase
                .from("subscriptions")
                .select("plan")
                .eq("user_id", user.id)
                .single()
                .then(({ data }) => {
                    if (data) setCurrentPlan(data.plan);
                });
        }
    }, [user]);

    const handlePlanAction = (planId: string) => {
        if (!user) {
            navigate("/signup");
            return;
        }
        if (planId === "enterprise") {
            window.open("mailto:sales@deepguard.ai?subject=Enterprise%20Plan", "_blank");
            return;
        }
        navigate("/dashboard/billing", { state: { upgradeTo: planId } });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero */}
            <section className="border-b border-border bg-muted">
                <div className="container py-16 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 border border-border bg-background rounded-md px-3 py-1 text-xs font-bold tracking-wide shadow-xs">
                        <Shield className="h-3 w-3" />
                        Pricing
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                        Simple, Transparent<br />
                        <span className="text-muted-foreground">Pricing</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                        Start free. Upgrade when you need more scans, advanced features, or team collaboration.
                    </p>
                </div>
            </section>

            {/* Plans Grid */}
            <section className="border-b border-border">
                <div className="container py-16">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {PLANS.map((plan) => {
                            const Icon = plan.icon;
                            const isCurrent = currentPlan === plan.id;

                            return (
                                <div
                                    key={plan.id}
                                    className={cn(
                                        "relative flex flex-col border border-border bg-card rounded-lg shadow-md transition-transform hover:-translate-y-1",
                                        plan.highlighted && "ring-4 ring-foreground ring-offset-4 ring-offset-background"
                                    )}
                                >
                                    {/* Popular badge */}
                                    {plan.highlighted && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 border border-border rounded-md bg-foreground px-4 py-1 text-xs font-bold tracking-wide text-background">
                                            Most Popular
                                        </div>
                                    )}

                                    {isCurrent && (
                                        <div className="absolute -top-4 right-4 border-2 border-chart-2 bg-chart-2 px-3 py-1 text-xs font-bold tracking-wide text-white">
                                            Current Plan
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div className="border-b border-border p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className="h-5 w-5" />
                                            <h3 className="text-lg font-bold tracking-wide">{plan.name}</h3>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold font-mono">{plan.price}</span>
                                            <span className="text-sm text-muted-foreground">{plan.period}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                                    </div>

                                    {/* Limits */}
                                    <div className="border-b border-border bg-muted/50 p-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Scans/mo</span>
                                            <span className="font-bold font-mono">
                                                {plan.scans === -1 ? "Unlimited" : plan.scans.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-muted-foreground">API Keys</span>
                                            <span className="font-bold font-mono">
                                                {plan.apiKeys === -1 ? "Unlimited" : plan.apiKeys}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1 p-6">
                                        <ul className="space-y-2.5">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                    {feature.included ? (
                                                        <Check className="h-4 w-4 shrink-0 text-chart-2" />
                                                    ) : (
                                                        <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                                                    )}
                                                    <span className={cn(!feature.included && "text-muted-foreground/50")}>
                                                        {feature.name}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* CTA */}
                                    <div className="p-6 pt-0">
                                        <Button
                                            onClick={() => handlePlanAction(plan.id)}
                                            disabled={isCurrent}
                                            className={cn(
                                                "w-full gap-2 font-bold tracking-wide",
                                                plan.highlighted && !isCurrent && "bg-primary text-primary-foreground hover:bg-foreground/90"
                                            )}
                                            variant={plan.highlighted ? "default" : "outline"}
                                        >
                                            {isCurrent ? "Current Plan" : plan.cta}
                                            {!isCurrent && <ArrowRight className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="border-b border-border bg-muted">
                <div className="container py-16">
                    <h2 className="mb-8 text-center text-3xl font-extrabold tracking-tight">
                        Frequently Asked <span className="text-muted-foreground">Questions</span>
                    </h2>
                    <div className="mx-auto max-w-2xl space-y-3">
                        {FAQ.map((item, i) => (
                            <div key={i} className="border border-border bg-card rounded-lg shadow-xs">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="flex w-full items-center justify-between p-4 text-left font-bold tracking-wide text-sm hover:bg-accent"
                                >
                                    {item.q}
                                    <span className="ml-4 shrink-0 font-mono">{openFaq === i ? "−" : "+"}</span>
                                </button>
                                {openFaq === i && (
                                    <div className="border-t border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold tracking-wide">DeepGuard AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">© 2026 DeepGuard AI</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Pricing;
