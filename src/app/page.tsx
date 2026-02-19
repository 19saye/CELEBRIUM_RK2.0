"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  Github,
  Activity,
  Cpu,
  Zap,
  Shield,
  BarChart3,
  ExternalLink,
  Bot,
  Terminal,
  Layers,
  Globe,
  ArrowRight
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DigitalTwinChat from "@/components/DigitalTwinChat";
import { AmbientBackground } from "@/components/AmbientBackground";
import projects from "@/data/projects.json";

// Borsa listesi
const COINS = ["BINANCE:ETHUSDT", "BINANCE:ENAUSDT", "BINANCE:HYPEUSDT", "BINANCE:BTCUSDT"];

const newsItems = [
  "POST-QUANTUM CRYPTOGRAPHY STANDARDS UPDATED",
  "BTC HITS LOCAL HIGH - MARKET INTEGRITY AT 94%",
  "QUANTUM RADAR PHASE 2 COMMENCED",
  "ETH STAKING VOLUME SURPASSES ESTIMATES",
  "PQC AUTOMOTIVE: NEW SECURITY LAYER IMPLEMENTED"
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeCoin, setActiveCoin] = useState(COINS[0]);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);

  // Initialize hooks inside the component
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Transforms
  const heroOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.1], [1, 0.9]);

  useEffect(() => {
    setMounted(true);
    fetch("https://api.github.com/users/19saye/repos?sort=updated&per_page=6")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGithubRepos(data.slice(0, 6));
      })
      .catch(err => console.error("GitHub Fetch Error:", err));
  }, []);

  // Hybrid Hydration Strategy: Prevent all hydration errors by rendering empty or loader
  if (!mounted) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <AnimatePresence>
      <main className="relative min-h-screen selection:bg-white selection:text-black overflow-x-hidden bg-black">
        <AmbientBackground />

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 px-6 py-6 md:px-12 pointer-events-none">
          <div className="container mx-auto flex justify-between items-center pointer-events-auto">
            <Link href="/" className="flex items-center gap-3 transition-all">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black/50 backdrop-blur-xl hover:border-primary transition-colors">
                <span className="font-display font-black text-xs text-white">RK</span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-[10px] font-mono text-white/50 tracking-[0.2em] uppercase">Rabiya Kömür</div>
                <div className="text-[8px] font-mono text-primary tracking-[0.4em] uppercase"> QUANTUM RESEARCHER</div>
              </div>
            </Link>

            <div className="flex gap-6 items-center glass px-8 py-3 rounded-2xl border-white/5 shadow-2x backdrop-blur-3xl">
              <Link href="/thoughts" className="text-[10px] font-mono tracking-[0.3em] text-white/40 hover:text-white transition-all uppercase">Düşünceler</Link>
              <div className="w-[1px] h-3 bg-white/10" />
              <Link href="/blog" className="text-[10px] font-mono tracking-[0.3em] text-white/40 hover:text-white transition-all uppercase">Arşiv</Link>
              <div className="w-[1px] h-3 bg-white/10" />
              <Link href="/admin/dashboard" className="text-[10px] font-mono tracking-[0.3em] text-white/40 hover:text-white transition-all uppercase">Admin</Link>
            </div>
          </div>
        </nav>

        {/* Hero: Digital Twin Centerpiece */}
        <section className="min-h-screen flex flex-col items-center justify-center relative px-6 text-center pt-20">
          <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="space-y-12 max-w-6xl w-full">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left: AI Twin Presence */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-left space-y-8"
              >
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono text-primary tracking-[0.3em] uppercase">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Dijital İkiz Aktif
                </div>

                <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-tight italic uppercase text-white">
                  PQC<br />
                  <span className="text-primary italic">RESEARCHER</span>
                </h1>

                <p className="max-w-md text-lg text-white/40 font-mono italic leading-relaxed text-left">
                  Post-Quantum Cryptography ve Quantum Radar sistemleri üzerine, <span className="text-white">hassas dijital mimari</span> ve siber güvenlik araştırmaları.
                </p>

                <div className="flex gap-4">
                  <button onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))} className="px-8 py-4 bg-white text-black font-display font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    Chat with AI_RK2.0
                  </button>
                  <Link href="/thoughts" className="px-8 py-4 border border-white/10 font-display font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all text-white/60">
                    Projeleri Gör
                  </Link>
                </div>
              </motion.div>

              {/* Right: Midas Performance Gauges (Visual) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square glass rounded-full border-white/10 flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                <div className="space-y-2 text-center relative z-10">
                  <Bot size={80} className="mx-auto text-primary animate-pulse" strokeWidth={1} />
                  <div className="text-[10px] font-mono text-white/30 tracking-[0.5em] uppercase mt-4">HIPOCAMPUS_v2.0</div>
                  <div className="flex justify-center gap-2">
                    <div className="w-1 h-3 bg-primary/40" />
                    <div className="w-1 h-6 bg-primary" />
                    <div className="w-1 h-4 bg-primary/60" />
                  </div>
                </div>

                {/* Spinning Ring */}
                <div className="absolute inset-4 border-2 border-dashed border-white/5 rounded-full animate-spin-slow" />
                <div className="absolute inset-12 border border-primary/10 rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* News Ticker Bar */}
        <div className="marquee-container relative z-20 border-y border-white/5 bg-white/[0.02]">
          <div className="marquee-content gap-20 flex py-4">
            {[...newsItems, ...newsItems].map((item, i) => (
              <span key={i} className="text-[10px] font-mono tracking-[0.2em] text-white/20 uppercase flex items-center gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" /> {item}
              </span>
            ))}
          </div>
        </div>

        {/* MIDAS PRO TERMINAL */}
        <section className="container mx-auto px-6 md:px-12 py-32 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight uppercase italic flex items-center gap-4 text-white text-left">
                <BarChart3 size={40} className="text-secondary" /> BINANCE  <span className="text-primary italic">TERMINAL </span>
              </h2>
              <p className="text-sm text-white/40 font-mono italic tracking-wide text-left">Gerçek zamanlı piyasa analizi ve varlık bütünlüğü izleme sistemi.</p>
            </div>
            <div className="flex gap-2 glass p-1.5 rounded-2xl border-white/10">
              {COINS.map(coin => (
                <button
                  key={coin}
                  onClick={() => setActiveCoin(coin)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-mono font-bold tracking-widest transition-all ${activeCoin === coin ? 'bg-primary text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  {coin.split(':')[1].replace('USDT', '')}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={activeCoin}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[600px] w-full glass rounded-[2.5rem] border-white/5 relative overflow-hidden ring-1 ring-white/10"
          >
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3 glass px-4 py-2 text-[10px] font-mono bg-black/50 rounded-full border-white/5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE: {activeCoin}
            </div>
            <iframe
              src={`https://s.tradingview.com/widgetembed/?symbol=${activeCoin}&interval=1&theme=dark&style=1&hide_top_toolbar=true`}
              className="w-full h-full opacity-70 filter contrast-125 saturate-50 hover:saturate-100 transition-all duration-1000"
              frameBorder="0"
            />
          </motion.div>
        </section>

        {/* LAB REPOS: Bento Grid */}
        <section className="container mx-auto px-6 md:px-12 py-32 space-y-20">
          <div className="space-y-4 text-center">
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic text-white">HIPOCAMPUS<span className="text-primary tracking-widest">_v2.0</span></h2>
            <p className="text-sm text-white/30 font-mono italic max-w-2xl mx-auto uppercase tracking-widest">Açık kaynak araştırmalar, kuantum projeleri ve siber güvenlik çalışmaları.</p>
          </div>

          {/* Premium Projects Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-[450px] rounded-[2.5rem] overflow-hidden border border-white/5"
              >
                <div className="absolute inset-0">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex gap-2 mb-4">
                    {project.tech.map(t => (
                      <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-mono text-white/40 uppercase tracking-widest">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-display font-black text-white uppercase italic mb-2">{project.name}</h3>
                  <p className="text-xs text-white/40 font-mono italic leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-20 text-center">
            <h3 className="text-xl font-mono text-white/20 uppercase tracking-[0.3em] mb-12">GitHub Global_Repos</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {githubRepos.map((repo, i) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass p-10 rounded-[2.5rem] border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden ${i === 0 ? 'md:col-span-2' : ''}`}
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                    <Github size={24} />
                  </div>
                  <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">{repo.language || "Research"}</div>
                </div>
                <h3 className="text-2xl font-display font-black group-hover:text-white transition-colors uppercase italic truncate text-white text-left">{repo.name}</h3>
                <p className="mt-4 text-sm text-white/40 font-mono leading-relaxed italic line-clamp-2 text-left">
                  {repo.description || "Güvenli telemetri ve kriptografik analiz çalışmaları."}
                </p>

                <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
                  <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-white/20">
                    <span className="flex items-center gap-2"><Zap size={10} className="text-primary" /> {repo.stargazers_count}</span>
                    <span className="flex items-center gap-2"><Activity size={10} /> Syncing</span>
                  </div>
                  <Link href={repo.html_url} target="_blank" className="text-white/20 hover:text-white transition-colors">
                    <ExternalLink size={20} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="py-32 text-center space-y-8 relative z-10 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-center gap-12 md:gap-24">
            {[
              { label: "Lokasyon", value: "İstanbul / Londra" },
              { label: "Durum", value: "Phase 2 Geliştirme" },
              { label: "Uzmanlık", value: "PQC & Kuantum" }
            ].map(item => (
              <div key={item.label}>
                <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em] mb-2 text-center">{item.label}</div>
                <div className="text-[12px] font-mono text-white/60 uppercase tracking-widest text-center">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="pt-20 font-mono text-[9px] text-white/10 uppercase tracking-[0.5em]">
            © 2026 RABIYA KOMUR // RK_V2.0
          </div>
        </footer>

        <DigitalTwinChat />
      </main>
    </AnimatePresence>
  );
}
