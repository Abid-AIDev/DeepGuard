import { useState } from "react";
import { Shield, Github, LogIn, User, LogOut, LayoutDashboard, History, Key, Menu, X, Layers, FileSearch, CreditCard, Tag, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  const isActive = (path: string) => location.pathname === path;
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <header className="border-b-4 border-foreground bg-card">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="border-2 border-foreground bg-background p-1.5 shadow-xs">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold uppercase tracking-wider">
            DeepGuard AI
          </span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="sm:hidden border-2 border-foreground p-1.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-2 sm:flex">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleTheme}
            className="font-medium uppercase tracking-wide"
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </Button>

          <Link to="/deepfake">
            <Button
              variant={isActive("/deepfake") ? "default" : "ghost"}
              size="sm"
              className={cn("font-medium uppercase tracking-wide", isActive("/deepfake") && "pointer-events-none")}
            >
              Scan
            </Button>
          </Link>
          <Link to="/batch">
            <Button
              variant={isActive("/batch") ? "default" : "ghost"}
              size="sm"
              className={cn("font-medium uppercase tracking-wide", isActive("/batch") && "pointer-events-none")}
            >
              Batch
            </Button>
          </Link>
          <Link to="/forensics">
            <Button
              variant={isActive("/forensics") ? "default" : "ghost"}
              size="sm"
              className={cn("font-medium uppercase tracking-wide", isActive("/forensics") && "pointer-events-none")}
            >
              Forensics
            </Button>
          </Link>
          <Link to="/pricing">
            <Button
              variant={isActive("/pricing") ? "default" : "ghost"}
              size="sm"
              className={cn("font-medium uppercase tracking-wide", isActive("/pricing") && "pointer-events-none")}
            >
              Pricing
            </Button>
          </Link>

          {user ? (
            <>
              <Link to="/dashboard">
                <Button
                  variant={isDashboard ? "default" : "ghost"}
                  size="sm"
                  className="font-medium uppercase tracking-wide"
                >
                  Dashboard
                </Button>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 border-2 border-foreground px-3 py-1.5 text-sm font-bold uppercase tracking-wide shadow-xs hover:bg-accent"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 border-4 border-foreground bg-card shadow-lg">
                      <div className="border-b-2 border-foreground p-3">
                        <p className="text-xs font-bold uppercase text-muted-foreground">
                          Signed in as
                        </p>
                        <p className="mt-0.5 truncate text-sm font-bold">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wide hover:bg-accent"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/history"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wide hover:bg-accent"
                        >
                          <History className="h-4 w-4" />
                          Scan History
                        </Link>
                        <Link
                          to="/dashboard/api-keys"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wide hover:bg-accent"
                        >
                          <Key className="h-4 w-4" />
                          API Keys
                        </Link>
                        <Link
                          to="/dashboard/billing"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wide hover:bg-accent"
                        >
                          <CreditCard className="h-4 w-4" />
                          Billing
                        </Link>
                      </div>
                      <div className="border-t-2 border-foreground p-1">
                        <button
                          onClick={() => { setShowDropdown(false); signOut(); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wide text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-2 font-medium uppercase tracking-wide">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gap-2 font-medium uppercase tracking-wide">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="border-t-2 border-foreground bg-card p-4 sm:hidden">
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              onClick={cycleTheme}
              className="w-full justify-start gap-2 font-medium uppercase tracking-wide"
            >
              <ThemeIcon className="h-4 w-4" /> Theme: {theme}
            </Button>
            <Link to="/deepfake" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive("/deepfake") ? "default" : "ghost"} className="w-full justify-start gap-2 font-medium uppercase tracking-wide">
                Scan
              </Button>
            </Link>
            <Link to="/batch" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive("/batch") ? "default" : "ghost"} className="w-full justify-start gap-2 font-medium uppercase tracking-wide">
                <Layers className="h-4 w-4" /> Batch
              </Button>
            </Link>
            <Link to="/forensics" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive("/forensics") ? "default" : "ghost"} className="w-full justify-start gap-2 font-medium uppercase tracking-wide">
                <FileSearch className="h-4 w-4" /> Forensics
              </Button>
            </Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isActive("/pricing") ? "default" : "ghost"} className="w-full justify-start gap-2 font-medium uppercase tracking-wide">
                <Tag className="h-4 w-4" /> Pricing
              </Button>
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 font-medium uppercase tracking-wide">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                <Link to="/dashboard/history" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 font-medium uppercase tracking-wide">
                    <History className="h-4 w-4" /> History
                  </Button>
                </Link>
                <Link to="/dashboard/api-keys" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 font-medium uppercase tracking-wide">
                    <Key className="h-4 w-4" /> API Keys
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 font-medium uppercase tracking-wide text-destructive"
                  onClick={() => { setMobileMenuOpen(false); signOut(); }}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 font-medium uppercase tracking-wide">
                    <LogIn className="h-4 w-4" /> Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start gap-2 font-medium uppercase tracking-wide">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
