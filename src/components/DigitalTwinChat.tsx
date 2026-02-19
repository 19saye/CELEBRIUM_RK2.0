"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles, ArrowRight } from "lucide-react";
import { chatWithDigitalTwin } from "@/app/actions/chat";
import twinKnowledge from "@/data/digital-twin-knowledge.json";
import projects from "@/data/projects.json";

interface Message {
    role: "assistant" | "user";
    content: string;
}

export default function DigitalTwinChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `Selam! Ben RK_2.0. ${(twinKnowledge as any).identity.name}'nın dijital ikiziyim. 3. sınıf CS öğrencisi ve bağımsız bir kuantum araştırmacısıyım. Benimle kuantum radar, PQC veya algoritmik finans üzerine konuşabilirsin.`,
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isOpen, isTyping]);

    // Listen for external open-chat events
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-chat', handleOpen);
        return () => window.removeEventListener('open-chat', handleOpen);
    }, []);

    const handleSuggestedQuestion = (question: string) => {
        setInput(question);
        // We trigger handleSend slightly later to ensure state is updated, or just call it with the value
        setTimeout(() => {
            const sendBtn = document.getElementById('chat-send-btn');
            sendBtn?.click();
        }, 100);
    };

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = { role: "user" as const, content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Call the LLM-powered server action
            const response = await chatWithDigitalTwin(
                messages.slice(1), // Send history (excluding initial message)
                input
            );

            setMessages((prev) => [...prev, { role: "assistant", content: response }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Bağlantıda bir sorun var, dijital belleğim şu an yanıt veremiyor." },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 p-0.5 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.3)] z-50 group transition-all"
            >
                <div className="bg-black px-6 py-4 rounded-[14px] flex items-center gap-3 font-display font-black text-[10px] uppercase tracking-[0.3em] text-white group-hover:text-primary transition-colors border border-white/5 shadow-2xl">
                    <Sparkles size={14} className="text-white/40 group-hover:text-white transition-colors" />
                    <span>DFİGİTAL_TWIN_RK2.0</span>
                </div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="fixed bottom-28 right-8 w-[380px] md:w-[450px] h-[600px] glass z-50 flex flex-col overflow-hidden border-white/10 shadow-2xl rounded-3xl"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40">
                                    <Bot size={20} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em]">RK_2.0</div>
                                    <div className="text-[8px] text-white/20 font-mono flex items-center gap-1.5 uppercase tracking-widest mt-1">
                                        <span className="w-1 h-1 rounded-full bg-secondary shadow-[0_0_8px_rgba(99,102,241,0.5)]" /> Synced_Active
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 font-mono text-[10px] leading-relaxed">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] p-5 rounded-2xl ${msg.role === "user" ? "bg-white/[0.03] text-white border border-white/10" : "bg-white/[0.01] text-white border border-white/5"}`}>
                                        <div className="flex items-center gap-2 mb-3 opacity-20 text-[8px] uppercase font-bold tracking-[0.2em]">
                                            {msg.role === "assistant" ? <Bot size={10} /> : <User size={10} />}
                                            <span>{msg.role === "assistant" ? "HIPOCAMPUS_v2.0" : "VISITOR"}</span>
                                        </div>
                                        <div className="space-y-4">
                                            {msg.content.split(/(\[PROJECT:.*?\])/g).map((part, index) => {
                                                const projectMatch = part.match(/\[PROJECT:(.*?)\]/);
                                                if (projectMatch) {
                                                    const projectId = projectMatch[1];
                                                    const project = projects.find(p => p.id === projectId);
                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleSuggestedQuestion(`Bana ${project?.name || projectId} projesinden bahsedebilir misin?`)}
                                                            className="block w-full text-left p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all group"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-display font-black uppercase tracking-widest text-primary group-hover:text-white transition-colors">
                                                                    {project?.name || projectId}
                                                                </span>
                                                                <ArrowRight size={14} className="text-primary/40 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                                            </div>
                                                            <div className="text-[8px] text-white/40 mt-1 font-mono uppercase tracking-tighter">
                                                                Research_Node // Ready_to_Explore
                                                            </div>
                                                        </button>
                                                    );
                                                }
                                                return <span key={index}>{part}</span>;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {messages.length === 1 && (
                                <div className="grid grid-cols-1 gap-3 px-8 pb-4">
                                    {[
                                        "Rabiya Kömür kimdir?",
                                        "Projelerin nelerdir?",
                                        "Sana nasıl ulaşabilirim?"
                                    ].map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleSuggestedQuestion(q)}
                                            className="text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/30 transition-all text-[9px] text-white/40 hover:text-white uppercase tracking-widest font-mono"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-8 bg-white/[0.01] border-t border-white/5">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Enter query..."
                                    className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-[10px] focus:outline-none focus:border-white/20 transition-all font-mono tracking-wider italic text-white/70"
                                />
                                <button
                                    id="chat-send-btn"
                                    onClick={handleSend}
                                    disabled={isTyping}
                                    className="w-14 h-14 bg-white text-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-20"
                                >
                                    <Send size={18} strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
