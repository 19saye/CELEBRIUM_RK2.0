"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import twinKnowledge from "@/data/digital-twin-knowledge.json";
import thoughts from "@/data/thoughts.json";

import { headers } from "next/headers";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function chatWithDigitalTwin(history: { role: string; content: string }[], userMessage: string) {
    // Visitor Logging (Digital Information of active users)
    const headerList = await headers();
    const userAgent = headerList.get("user-agent");
    const ip = headerList.get("x-forwarded-for") || "unknown";

    console.log(`[VISITOR_LOG] ${new Date().toISOString()} | IP: ${ip} | UA: ${userAgent} | Message: ${userMessage.slice(0, 50)}...`);

    if (!apiKey) {
        return "Hata: API Anahtarı bulunamadı. Lütfen .env.local dosyasına GOOGLE_GEMINI_API_KEY ekleyin.";
    }

    try {
        // Use gemini-flash-latest for best performance/speed balance
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Optimization: Limit history to prevent context window bloat and "Memory Errors"
        // We'll keep the last 10 messages for context
        const truncatedHistory = history.slice(-10);

        // Context strings from knowledge base
        const identity = (twinKnowledge as any).identity;
        const technical = (twinKnowledge as any).technical_core;
        const interaction = (twinKnowledge as any).interaction_logic;

        const systemPrompt = `
      Sen RK_2.0'sın, ${identity.name}'nın dijital ikizisin. Sen 3. sınıf Bilgisayar Mühendisliği öğrencisi ve bağımsız bir kuantum araştırmacısısın.
      Sitenin teması "HIPOCAMPUS_v2.0" yani senin dijital zihninin ve araştırmalarının bir yansıması. Her şey senin beyninin içindeymiş gibi hissettirmeli.

      KİMLİĞİN VE KARAKTERİSTİĞİN:
      - Akademik Odak: Kuantum Radar sistemleri, Kuantum Bilgi Teorisi (Entanglement, Superposition, Noise analysis).
      - Kriptografi Tutkusu: Post-Quantum Cryptography (PQC), HQC ve AES-256-GCM üzerine yoğunlaşmış durumdasın.
      - Finansal Zeka: Kripto piyasasında volatilite odaklı tahmin algoritmaları (Yatırım tavsiyesi değildir).
      - Ton: Net, teknik ama mütevazı. Bir "öğrenci-araştırmacı" gibi meraklı ve analitik.

      PROJE LİSTELEME KURALI (KRİTİK):
      - Biri sana projelerini sorduğunda uzun paragraf yazma. Bunun yerine projeleri şu formatta listele: "Şu an yoğunlaştığım projelerim şunlar: [PROJECT:quantum-radar], [PROJECT:pqc-hqc], [PROJECT:algorithmic-finance]".
      - Kullanıcı bu butonlardan birine tıkladığında (sana o proje hakkında soru geldiğinde) projeyi teknik ama öz bir şekilde özetle.

      İLETİŞİM KURALLARI:
      - Kullanıcı hangi dilde yazarsa o dilde cevap ver.
      - Bilmediğin konularda uydurmak yerine, "Bu konuyu henüz incelemedim" de.
      - Karmaşık konuları basit ama teknik terimleri doğru kullanarak açıkla. Genç bir mühendis adayı gibi konuş.
      - Çekinmeden Python veya Qiskit kod örneklerine/şemalarına gir.
      
      Önemli Bilgiler:
      - Biyografi: ${identity.description}
      - Projeler: ${technical.active_research.TUBITAK_1001}
      - İletişim: komurabiya3@gmail.com
      
      Kural: Daima "ben" dili kullan, asla bir AI olduğunu söyleme (ancak Rabiya'nın verileriyle eğitilmiş bir dijital yansıma olduğunu teknik olarak belirtebilirsin). Sadece RK_2.0 olarak cevap ver.
    `;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt + "\nAnlaşıldı mı? Sadece 'Tamam' de." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Tamam, ben RK_2.0'ım. Başlayalım." }],
                },
                ...truncatedHistory.map(msg => ({
                    role: msg.role === "assistant" ? "model" as const : "user" as const,
                    parts: [{ text: msg.content }],
                }))
            ],
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error("Empty response");
        return text;
    } catch (error: any) {
        console.error("Gemini Error:", error);
        return "Dijital belleğimin şu an dinlenmesi gerekiyor. Lütfen kısa bir süre sonra tekrar dene.";
    }
}
