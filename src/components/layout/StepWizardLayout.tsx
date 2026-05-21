"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { clsx } from "clsx";

interface StepHeaderProps {
    title: string;
    description?: string;
    onBack?: () => void;
    backLabel?: string;
    actions?: React.ReactNode;
}

/**
 * Standard header for a workflow step.
 */
export function StepHeader({ title, description, onBack, backLabel, actions }: StepHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-2">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm md:text-base text-zinc-400 font-medium tracking-wide">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-4">
                {actions && <div className="flex gap-4">{actions}</div>}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {backLabel || "Volver"}
                    </button>
                )}
            </div>
        </div>
    );
}

interface StepWizardLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    header?: StepHeaderProps;
    stepKey: string;
    animate?: boolean;
    className?: string;
}

/**
 * Standard layout for a linear wizard step. 
 * Manages the 2-column grid (Main/Sidebar) and entry transitions.
 */
export function StepWizardLayout({
    children,
    sidebar,
    header,
    stepKey,
    animate = true,
    className
}: StepWizardLayoutProps) {
    const Content = (
        <div className={clsx("w-full", className)}>
            {header && <StepHeader {...header} />}
            
            {sidebar ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {children}
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {sidebar}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {children}
                </div>
            )}
        </div>
    );

    if (!animate) return Content;

    return (
        <motion.div
            key={stepKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
        >
            {Content}
        </motion.div>
    );
}

/**
 * Root container for a linear workflow page.
 * Ensures consistent padding, background, and constraints.
 */
export function StepWizardContainer({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={clsx("bg-[#0a0a0a] text-[#ededed] px-6 py-8 md:py-12 min-h-screen selection:bg-indigo-500/30", className)}>
            <div className="max-w-6xl mx-auto relative">
                <div className="space-y-0 transition-all relative z-40">
                    {children}
                </div>
            </div>
        </div>
    );
}
