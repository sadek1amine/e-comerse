"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  ArrowLeft,
  LogOut,
  X,
} from "lucide-react";

interface DashboardSidebarProps {
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({ onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { showToast } = useToast();

  const links = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Stores", href: "/dashboard/stores", icon: Store },
    { name: "My Products", href: "/dashboard/products", icon: ShoppingBag },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast("Signed out successfully", "success");
    } catch (err) {
      showToast("Error signing out", "error");
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/40 w-64 md:w-72 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-500 font-sans">
            S-Mahalat
          </span>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Exit options */}
      <div className="p-4 border-t border-border/40 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
