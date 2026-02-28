"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
            title="Logout"
        >
            <div className="p-2 rounded-lg bg-muted group-hover:bg-accent border border-border transition-all">
                <LogOut className="w-4 h-4" />
            </div>
            <span className="hidden md:inline text-sm font-medium">Logout</span>
        </button>
    );
}
