import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Shield,
    ArrowLeft,
    Key,
    Plus,
    Trash2,
    Copy,
    Check,
    Eye,
    EyeOff,
    AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyRow {
    id: string;
    name: string;
    key_prefix: string;
    is_active: boolean;
    rate_limit: number;
    last_used_at: string | null;
    created_at: string;
}

const generateApiKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const prefix = "dg_";
    let key = prefix;
    for (let i = 0; i < 40; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
};

const hashKey = async (key: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const ApiKeys = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [keys, setKeys] = useState<ApiKeyRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchKeys();
    }, [user]);

    const fetchKeys = async () => {
        const { data } = await supabase
            .from("api_keys")
            .select("*")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false });

        setKeys(data || []);
        setLoading(false);
    };

    const createKey = async () => {
        if (!newKeyName.trim()) return;
        setCreating(true);

        const rawKey = generateApiKey();
        const keyHash = await hashKey(rawKey);

        const { error } = await supabase.from("api_keys").insert({
            user_id: user!.id,
            name: newKeyName.trim(),
            key_prefix: rawKey.slice(0, 10),
            key_hash: keyHash,
            permissions: ["read"],
            rate_limit: 100,
        });

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            setCreatedKey(rawKey);
            setNewKeyName("");
            fetchKeys();
            toast({ title: "API Key Created", description: "Make sure to copy your key — it won't be shown again." });
        }
        setCreating(false);
    };

    const deleteKey = async (id: string) => {
        await supabase.from("api_keys").delete().eq("id", id);
        setKeys(keys.filter((k) => k.id !== id));
        toast({ title: "Key Deleted" });
    };

    const toggleKey = async (id: string, isActive: boolean) => {
        await supabase.from("api_keys").update({ is_active: !isActive }).eq("id", id);
        setKeys(keys.map((k) => (k.id === id ? { ...k, is_active: !isActive } : k)));
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <section className="border-b border-border bg-muted">
                <div className="container py-12">
                    <Link
                        to="/dashboard"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                API Keys
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage API keys for integrating DeepGuard AI into your applications
                            </p>
                        </div>
                        <Button
                            onClick={() => { setShowCreateForm(true); setCreatedKey(null); }}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create Key
                        </Button>
                    </div>

                    {/* Created Key Alert */}
                    {createdKey && (
                        <div className="mb-6 border-4 border-chart-4 bg-chart-4/10 p-6">
                            <div className="mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-chart-4" />
                                <h3 className="font-bold uppercase">Save Your API Key</h3>
                            </div>
                            <p className="mb-3 text-sm text-muted-foreground">
                                This key will only be shown once. Copy it now and store it securely.
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 border border-border bg-background rounded-md px-3 py-2 font-mono text-sm">
                                    {createdKey}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(createdKey, "new")}
                                    className="shrink-0"
                                >
                                    {copiedId === "new" ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Create Form */}
                    {showCreateForm && !createdKey && (
                        <div className="mb-6 border border-border bg-card rounded-lg p-6 shadow-md">
                            <h3 className="mb-4 font-bold uppercase">Create New API Key</h3>
                            <div className="flex gap-3">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="keyName" className="text-xs font-bold tracking-wide">
                                        Key Name
                                    </Label>
                                    <Input
                                        id="keyName"
                                        placeholder="e.g. Production API, My App"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        className="border border-border rounded-md"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button onClick={createKey} disabled={!newKeyName.trim() || creating} className="gap-2">
                                    {creating ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin border-2 border-background border-t-transparent" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Key className="h-4 w-4" />
                                            Generate Key
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Keys List */}
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 animate-pulse border border-border/30 rounded-lg bg-accent" />
                            ))}
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="border-2 border-dashed border-border p-12 text-center">
                            <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 font-bold uppercase text-muted-foreground">
                                No API keys yet
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Create an API key to integrate deepfake detection into your apps.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {keys.map((apiKey) => (
                                <div
                                    key={apiKey.id}
                                    className={`border border-border bg-card rounded-lg p-5 shadow-sm ${!apiKey.is_active ? "opacity-60" : ""
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 rounded-lg p-2 shadow-xs">
                                                <Key className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold">{apiKey.name}</p>
                                                    {!apiKey.is_active && (
                                                        <span className="border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                                                            Disabled
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {apiKey.key_prefix}••••••••••••
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="hidden text-right text-xs text-muted-foreground sm:block">
                                                <p>Created: {new Date(apiKey.created_at).toLocaleDateString()}</p>
                                                <p>Rate: {apiKey.rate_limit} req/min</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleKey(apiKey.id, apiKey.is_active)}
                                                title={apiKey.is_active ? "Disable" : "Enable"}
                                            >
                                                {apiKey.is_active ? (
                                                    <EyeOff className="h-3 w-3" />
                                                ) : (
                                                    <Eye className="h-3 w-3" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                onClick={() => deleteKey(apiKey.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Usage Doc */}
                    <div className="mt-8 bg-primary text-primary-foreground rounded-lg p-6 text-background shadow-md">
                        <h3 className="mb-3 font-bold uppercase">Using Your API Key</h3>
                        <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-background/90">
                            <code>{`curl -X POST \\
  https://your-domain.com/api/v1/verify \\
  -H "Authorization: Bearer dg_YOUR_API_KEY" \\
  -F "file=@image.jpg"`}</code>
                        </pre>
                    </div>
                </div>
            </section>

            <footer className="border-t border-border bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold tracking-wide">DeepGuard AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">© 2026 DeepGuard AI.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ApiKeys;
