"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Wand2,
  Activity,
  Home,
  Shield,
  HelpCircle,
  ExternalLink,
  Zap,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/Badge";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const primaryItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Platform overview & metrics",
    },
    {
      name: "Complex Form",
      href: "/application",
      icon: FileSpreadsheet,
      badge: "Standard",
      description: "Multi-section financial form",
    },
    {
      name: "Simplified Wizard",
      href: "/simplified",
      icon: Wand2,
      badge: "Adaptive",
      description: "Step-by-step guided flow",
    },
    {
      name: "Interaction Analytics",
      href: "/analytics",
      icon: Activity,
      badge: "Live",
      description: "Friction heuristics & telemetry",
    },
  ];

  const secondaryItems = [
    {
      name: "Home / Overview",
      href: "/",
      icon: Home,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16",
        className
      )}
    >
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Navigation Group */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspaces
          </div>
          <nav className="space-y-1">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-aura-50 text-aura-800 shadow-sm shadow-aura-500/5 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        active ? "text-aura-600" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={active ? "indigo" : "default"}
                      className="text-[10px] px-1.5 py-0 shrink-0 font-normal"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Group */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Prototype Info Box */}
        <div className="rounded-xl p-3.5 bg-gradient-to-br from-aura-50/70 to-indigo-50/40 border border-aura-100/80">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-4 h-4 text-aura-600" />
            <span className="text-xs font-semibold text-aura-900">Adaptive UI Active</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            AuraGen monitors interaction friction and offers real-time form simplification.
          </p>
        </div>
      </div>

      {/* Footer Profile / Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-slate-700">Client Telemetry</span>
          </div>
          <Badge variant="success" dot className="text-[10px] px-1.5 py-0">
            Active
          </Badge>
        </div>
      </div>
    </aside>
  );
}
