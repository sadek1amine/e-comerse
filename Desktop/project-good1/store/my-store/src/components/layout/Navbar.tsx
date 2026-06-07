"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { Sun, Moon, Menu, X, ChevronRight, User, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const { theme, toggleTheme, isMounted } = useTheme();
  const { showToast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Track scroll position to update navbar style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast("Signed out successfully", "success");
    } catch (err) {
      showToast("Error signing out", "error");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Stores", href: "/stores" },
    { name: "Products", href: "/products" },
    { name: "Categories", href: "/categories" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "glass border-b border-border/40 py-3 shadow-sm"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-500 font-sans">
                S-Mahalat
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-primary relative py-1 ${
                      isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions Panel */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors cursor-pointer"
                aria-label="Toggle visual theme"
              >
                {isMounted && theme === "dark" ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User / Auth section */}
              {isMounted && !loading && (
                <div className="relative">
                  {user ? (
                    <div className="hidden md:flex items-center gap-3">
                      <Link
                        href="/dashboard"
                        className="text-sm font-semibold text-white bg-primary hover:bg-primary/95 transition-colors px-4 py-2 rounded-xl flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="p-2 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Sign Out"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="hidden md:flex items-center gap-3">
                      <Link
                        href="/login"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                      >
                        Log In
                      </Link>
                      <Link
                        href="/register"
                        className="text-sm font-semibold text-white bg-primary hover:bg-primary/95 transition-colors px-4 py-2 rounded-xl"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors md:hidden cursor-pointer"
                aria-label="Open navigation drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-full bg-card shadow-2xl flex flex-col p-6 border-l border-border/40"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  S-Mahalat
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors cursor-pointer"
                  aria-label="Close menu drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links inside Drawer */}
              <nav className="flex flex-col gap-3 flex-grow">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:translate-x-1"
                      }`}
                    >
                      <span className="text-base">{link.name}</span>
                      <ChevronRight className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-border/40 flex flex-col gap-4">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="w-full text-center font-semibold text-white bg-primary hover:bg-primary/95 transition-colors py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-center font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      className="text-center font-medium text-foreground bg-secondary hover:bg-muted transition-colors py-2.5 rounded-xl border border-border/40"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      className="text-center font-semibold text-white bg-primary hover:bg-primary/95 transition-colors py-2.5 rounded-xl"
                    >
                      Register
                    </Link>
                  </div>
                )}

                <div className="flex items-center justify-between text-muted-foreground text-sm mt-2">
                  <span>Theme Preference</span>
                  <button
                    onClick={toggleTheme}
                    className="p-2 hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer flex items-center gap-2 text-foreground font-medium"
                  >
                    {isMounted && theme === "dark" ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        Light
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-purple-400" />
                        Dark
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
