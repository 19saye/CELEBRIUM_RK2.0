"use client";

import { motion } from "framer-motion";

export function AmbientBackground() {
    return (
        <div className="ambient-container">
            {/* Neural Synapse Nodes */}
            <div className="absolute inset-0 z-0">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            opacity: [0.1, 0.3, 0.1],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                        className="absolute w-1 h-1 bg-primary/40 rounded-full blur-[2px]"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            boxShadow: '0 0 15px var(--color-primary)',
                        }}
                    />
                ))}
            </div>

            {/* Glowing Orbs */}
            <motion.div
                animate={{
                    x: [0, 100, -100, 0],
                    y: [0, -100, 100, 0],
                    scale: [1, 1.2, 0.8, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="ambient-orb orb-1"
            />
            <motion.div
                animate={{
                    x: [0, -150, 150, 0],
                    y: [0, 80, -80, 0],
                    scale: [1, 0.7, 1.3, 1],
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                className="ambient-orb orb-2"
            />

            <div className="fixed inset-0 bg-black/60 backdrop-blur-[100px]" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>
    );
}
