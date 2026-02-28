"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="p-2 rounded-lg bg-muted border border-border">
                <div className="w-4 h-4" />
            </div>
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            <div className="p-2 rounded-lg bg-muted group-hover:bg-accent border border-border transition-all">
                {isDark ? (
                    <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                    <Moon className="w-4 h-4 text-blue-600" />
                )}
            </div>
            <span className="hidden md:inline text-sm font-medium">Theme</span>
        </button>
    );
}
