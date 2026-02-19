"use client";

import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";

const POSTS = [
    {
        title: "Post-Quantum Cryptography in Automotive",
        excerpt: "Exploring the integration of HQC-128 and AES-GCM in modern vehicle telemetry systems.",
        date: "2026-02-15",
        slug: "pqc-automotive",
        category: "Security",
    },
    {
        title: "Market Trends: The Rise of AI Twins",
        excerpt: "How digital clones are changing the way we interact with personal brands and professionals.",
        date: "2026-02-14",
        slug: "ai-twins-trends",
        category: "Technology",
    },
];

export default function BlogPage() {
    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl">
            <header className="mb-12">
                <h1 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Insights & Footprints
                </h1>
                <p className="text-foreground/50 font-mono">Documentation of my learning journey and technical explorations.</p>
            </header>

            <div className="space-y-6">
                {POSTS.map((post, i) => (
                    <motion.div
                        key={post.slug}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link href={`/blog/${post.slug}`} className="block glass p-6 group hover:neon-border transition-all">
                            <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-widest text-primary font-mono">
                                <Calendar size={12} /> {post.date} • {post.category}
                            </div>
                            <h2 className="text-2xl font-display font-semibold mb-3 flex items-center justify-between">
                                {post.title}
                                <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                            </h2>
                            <p className="text-foreground/60 leading-relaxed">{post.excerpt}</p>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <Link href="/" className="text-sm font-mono text-foreground/30 hover:text-primary transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </main>
    );
}
