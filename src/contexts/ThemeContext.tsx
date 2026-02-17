import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "system",
    resolvedTheme: "light",
    setTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("deepguard-theme") as Theme) || "system";
        }
        return "system";
    });

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (t: Theme) => {
            let resolved: "light" | "dark";
            if (t === "system") {
                resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            } else {
                resolved = t;
            }

            if (resolved === "dark") {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }

            setResolvedTheme(resolved);
        };

        applyTheme(theme);

        // Listen for system changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") applyTheme("system");
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const setTheme = (t: Theme) => {
        localStorage.setItem("deepguard-theme", t);
        setThemeState(t);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
