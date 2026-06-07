"use client";

import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Send, Globe, Shield, HelpCircle, ShoppingBag } from "lucide-react";

function TwitterIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

export default function Footer() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    showToast(`Successfully subscribed: ${email}`, "success");
    setEmail("");
  };

  const footerLinks = [
    {
      title: "Discover Marketplace",
      links: [
        { name: "All Products", href: "/products" },
        { name: "All Stores", href: "/stores" },
        { name: "Global Categories", href: "/categories" }
      ]
    },
    {
      title: "Vendor Services",
      links: [
        { name: "Merchant Register", href: "/register" },
        { name: "Merchant Login", href: "/login" },
        { name: "Vendor Dashboard", href: "/dashboard" }
      ]
    },
    {
      title: "Platform & Support",
      links: [
        { name: "Terms of Service", href: "/" },
        { name: "Privacy Policy", href: "/" },
        { name: "Customer Help", href: "/" }
      ]
    }
  ];

  return (
    <footer className="bg-card border-t border-border/40 mt-auto">
      {/* Top section: Newsletter & Social */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-border/20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Logo & Headline */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-500">
                S-Mahalat
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              S-Mahalat is a premium multi-vendor SaaS platform allowing individuals and enterprises to launch digital stores and showcase products instantly.
            </p>
          </div>

          {/* Newsletter Form */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-foreground">Subscribe for platform updates</h4>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md w-full">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground text-foreground"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary text-white font-medium text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Join</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 lg:justify-end">
            {[
              { icon: TwitterIcon, href: "https://twitter.com", label: "Twitter" },
              { icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
              { icon: GithubIcon, href: "https://github.com", label: "GitHub" }
            ].map((soc, i) => (
              <a
                key={i}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all hover:-translate-y-0.5 cursor-pointer"
                aria-label={soc.label}
              >
                <soc.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Middle section: Links columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {footerLinks.map((col, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <h3 className="text-sm font-bold tracking-wider text-foreground uppercase">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section: Legalities */}
      <div className="bg-muted py-6 border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <span>© {new Date().getFullYear()} S-Mahalat Inc. All rights reserved.</span>
            <span className="hidden sm:inline text-border">|</span>
            <Link href="/" className="hover:text-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" /> Privacy Policy
            </Link>
            <Link href="/" className="hover:text-foreground flex items-center gap-1">
              <Globe className="w-3 h-3" /> Terms of Use
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
            <span>S-Mahalat SaaS platform (Demo)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
