"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Brain, Quote, Layers, Terminal } from "lucide-react";
import Link from "next/link";
import thoughts from "@/data/thoughts.json";
import { AmbientBackground } from "@/components/AmbientBackground";

export default function ThoughtsPage() {
    return (
        <main className="min-h-screen relative selection:bg-white selection:text-black p-4 md:p-12 overflow-hidden bg-black">
            <AmbientBackground />

            <div className="container mx-auto max-w-5xl relative z-10 space-y-12">
                <nav className="flex justify-between items-center glass p-6 rounded-2xl border-white/5 backdrop-blur-3xl px-8">
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer text-white/40 hover:text-white transition-all">
                        <ArrowLeft size={16} />
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">OUT CELEBRIUM </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 italic">ArXiv</span>
                    </div>
                </nav>

                <header className="space-y-6 pt-20 pb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[9px] font-mono text-primary tracking-[0.3em] uppercase"
                    >
                        <Terminal size={14} /> Intelligence_Thoughts_v2
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter italic uppercase leading-tight">
                        CELEBRIUM<br />
                        <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>PREFRONTAL CORTEXT</span>
                    </h1>
                    <p className="text-white/30 font-mono text-sm max-w-xl mx-auto italic leading-relaxed">
                        Stratejik çıkarımlar, kuantum araştırmaları ve teknik vizyonların kronolojik veri tabanı.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-40">
                    {thoughts.map((thought, i) => (
                        <motion.article
                            key={thought.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-10 rounded-[2rem] border-white/5 hover:bg-white/[0.02] transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <Quote size={100} />
                            </div>

                            <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                                <span className="px-5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[9px] font-mono text-primary tracking-[0.2em] uppercase">
                                    DAILY_{thought.category}
                                </span>
                                <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">{thought.date}</span>
                            </div>

                            <h2 className="text-2xl font-display font-bold mb-6 group-hover:text-primary transition-colors tracking-tight uppercase italic">
                                {thought.title}
                            </h2>
                            <p className="text-white/40 font-mono text-sm leading-relaxed italic">
                                {thought.content}
                            </p>
                        </motion.article>
                    ))}
                </div>

                <footer className="pb-12 text-center space-y-4 opacity-20">
                    <div className="w-8 h-8 rounded-full border border-white/20 mx-auto flex items-center justify-center">
                        <span className="font-display font-bold text-[8px]">RK_2.0</span>
                    </div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.4em]">Veri sonu / dijital ikiz rabiya</p>
                </footer>
            </div>
        </main>
    );
}
