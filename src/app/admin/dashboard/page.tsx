"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Activity, Globe, Monitor, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const MOCK_LOGS = [
    { id: 1, ip: "192.168.1.1", path: "/", ua: "Mozilla/5.0 (Macintosh...)", time: "2026-02-16T11:45:00Z" },
    { id: 2, ip: "94.54.12.8", path: "/blog", ua: "Chrome/121.0.0.0", time: "2026-02-16T11:40:22Z" },
    { id: 3, ip: "102.34.55.21", path: "/blog/pqc-automotive", ua: "Safari/605.1.15", time: "2026-02-16T11:35:10Z" },
    { id: 4, ip: "185.22.4.10", path: "/", ua: "Python-urllib/3.10", time: "2026-02-16T11:32:04Z" },
];

export default function AdminDashboard() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-black text-green-500 font-mono p-8">
            <header className="flex items-center justify-between mb-12 border-b border-green-900 pb-4">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <ShieldAlert className="animate-pulse" /> CYBER_FOOTPRINT_MONITOR_v1.0
                </h1>
                <div className="flex gap-4 text-xs opacity-70">
                    <span>SYSTEM_STABLE: OK</span>
                    <span>THREAT_LEVEL: LOW</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats */}
                <div className="glass border-green-900/30 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs">TOTAL_VISITORS</span>
                        <span className="text-xl">1,204</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs">AVG_TIME_ON_SITE</span>
                        <span className="text-xl">04:22</span>
                    </div>
                    <div className="mt-4 h-24 border-b border-green-900/30">
                        {/* Mock chart placeholder */}
                        <div className="w-full h-full flex items-end gap-1">
                            {[4, 6, 3, 8, 5, 9, 7].map((h, i) => (
                                <div key={i} className="flex-1 bg-green-900/50" style={{ height: `${h * 10}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Real-time Feed */}
                <div className="lg:col-span-2 glass border-green-900/30 p-6 overflow-hidden">
                    <h2 className="text-sm mb-4 flex items-center gap-2">
                        <Activity size={14} /> LIVE_TELEMETRY_STREAM
                    </h2>
                    <div className="space-y-3">
                        {MOCK_LOGS.map((log) => (
                            <div key={log.id} className="text-[10px] border-l-2 border-green-900 pl-3 py-1 hover:bg-green-900/10 transition-colors">
                                <div className="flex justify-between mb-1">
                                    <span className="text-primary-500 font-bold">{log.ip}</span>
                                    <span className="opacity-50">{new Date(log.time).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex gap-4 opacity-70">
                                    <span className="flex items-center gap-1"><Globe size={10} /> {log.path}</span>
                                    <span className="flex items-center gap-1 truncate max-w-[200px]"><Monitor size={10} /> {log.ua}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 glass border-red-900/30 bg-red-900/5 text-red-500 text-[10px]">
                <span className="font-bold">SECURITY_ALERT:</span> 3 failed login attempts detected from unknown IP 185.xx.xx.xx. Monitoring enhanced.
            </div>
        </main>
    );
}
