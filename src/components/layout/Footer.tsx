import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Cpu, RefreshCw } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-aura-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900">AuraGen</span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Self-healing generative UI that simplifies complex web interfaces dynamically based on user interaction patterns and friction detection.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Zero Sensitive Data Capture
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-aura-600" />
                Frontend Heuristic Engine
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/" className="hover:text-aura-600 transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-aura-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/application" className="hover:text-aura-600 transition-colors">
                  Financial Application
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-aura-600 transition-colors">
                  Interaction Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Prototype Notice
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Interaction-friction scores are prototype usability heuristics designed for adaptive interface demonstration, not clinical or cognitive measurements.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AuraGen. Next.js Adaptive User Interface Platform.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Frontend Development Phase</span>
            <span>•</span>
            <span className="text-slate-400">Strict Client-Side Isolation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
