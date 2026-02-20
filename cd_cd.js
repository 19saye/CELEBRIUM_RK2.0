const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function test() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Merhaba, sen kimsin?");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Error with gemini-1.5-flash:", e.status, e.statusText, e.message);

        try {
            console.log("Trying gemini-pro...");
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Merhaba, sen kimsin?");
            console.log("gemini-pro Response:", result.response.text());
        } catch (e2) {
            console.error("Error with gemini-pro as well:", e2.status, e2.statusText, e2.message);
        }
    }
}

test();
