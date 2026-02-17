import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogIn } from "lucide-react";

const Login = () => {
    const { signIn, user, loading } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (loading) return null;
    if (user) return <Navigate to="/dashboard" replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await signIn(email, password);

        if (error) {
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Welcome back!",
                description: "You have been logged in successfully.",
            });
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <section className="border-b-4 border-foreground bg-muted">
                <div className="container flex items-center justify-center py-16 md:py-24">
                    <div className="w-full max-w-md">
                        <div className="border-4 border-foreground bg-card p-8 shadow-lg">
                            {/* Header */}
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-xs">
                                    <Shield className="h-3 w-3" />
                                    DeepGuard AI
                                </div>
                                <h1 className="text-2xl font-bold uppercase tracking-tight">
                                    Sign In
                                </h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Enter your credentials to access your account
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-bold uppercase text-xs tracking-wider">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="border-2 border-foreground"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="font-bold uppercase text-xs tracking-wider">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="border-2 border-foreground"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full border-4 border-foreground bg-foreground text-background font-bold uppercase tracking-wide shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin border-2 border-background border-t-transparent" />
                                            Signing in...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <LogIn className="h-4 w-4" />
                                            Sign In
                                        </span>
                                    )}
                                </Button>
                            </form>

                            {/* Footer */}
                            <div className="mt-6 text-center text-sm">
                                <span className="text-muted-foreground">Don't have an account? </span>
                                <Link
                                    to="/signup"
                                    className="font-bold uppercase underline underline-offset-4 hover:text-muted-foreground"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Login;
