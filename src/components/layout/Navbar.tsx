"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Activity,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Overview", href: "/", icon: Sparkles },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Financial Application", href: "/application", icon: FileText },
    { name: "Friction Analytics", href: "/analytics", icon: Activity },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aura-600 to-indigo-500 flex items-center justify-center text-white shadow-card group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-lg tracking-tight leading-none">
                  Aura<span className="text-aura-600">Gen</span>
                </span>
                <Badge variant="indigo" size="sm" className="font-medium text-[10px] py-0 px-1.5">
                  Adaptive
                </Badge>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Self-Healing UI Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-slate-100 text-aura-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", active ? "text-aura-600" : "text-slate-400")} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Status Area */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Local Telemetry</span>
            </div>

            <ButtonLink
              href="/application"
              size="sm"
              variant="accent"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Start Application
            </ButtonLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-aura-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-100 text-aura-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-aura-600" : "text-slate-400")} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <ButtonLink
              href="/application"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
              size="sm"
              variant="accent"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Start Application
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
