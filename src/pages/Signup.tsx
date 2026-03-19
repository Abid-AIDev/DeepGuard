import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus } from "lucide-react";

const Signup = () => {
    const { signUp, user, loading } = useAuth();
    const { toast } = useToast();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (loading) return null;
    if (user) return <Navigate to="/dashboard" replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (password.length < 6) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 6 characters.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        const { error } = await signUp(email, password, fullName);

        if (error) {
            toast({
                title: "Signup Failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Account Created!",
                description: "Please check your email to verify your account, or sign in directly.",
            });
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <section className="border-b border-border bg-muted">
                <div className="container flex items-center justify-center py-16 md:py-24">
                    <div className="w-full max-w-md">
                        <div className="border border-border bg-card rounded-lg p-8 shadow-lg">
                            {/* Header */}
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 inline-flex items-center gap-2 border border-border bg-background rounded-md px-3 py-1 text-xs font-bold tracking-wide shadow-xs">
                                    <Shield className="h-3 w-3" />
                                    DeepGuard AI
                                </div>
                                <h1 className="text-2xl font-extrabold tracking-tight">
                                    Create Account
                                </h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Sign up to save scan history and access API keys
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="font-bold uppercase text-xs tracking-wider">
                                        Full Name
                                    </Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="border border-border rounded-md"
                                    />
                                </div>

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
                                        className="border border-border rounded-md"
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
                                        minLength={6}
                                        className="border border-border rounded-md"
                                    />
                                    <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-primary-foreground rounded-lg text-background font-bold tracking-wide shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin border-2 border-background border-t-transparent" />
                                            Creating account...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <UserPlus className="h-4 w-4" />
                                            Create Account
                                        </span>
                                    )}
                                </Button>
                            </form>

                            {/* Footer */}
                            <div className="mt-6 text-center text-sm">
                                <span className="text-muted-foreground">Already have an account? </span>
                                <Link
                                    to="/login"
                                    className="font-bold uppercase underline underline-offset-4 hover:text-muted-foreground"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Signup;
