const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getGeminiRoomRecommendation(roomName, period, date) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "Gemini API key is not configured.";
        }

        const prompt = `Act as an intelligent campus scheduling assistant for CampusFlow. A user wants to book Room ${roomName} for Period ${period} on ${date}. Provide a short, professional, and helpful tip or recommendation regarding room utilization, energy saving, or conflict avoidance. Keep it under 2 sentences.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error('Gemini AI error:', error);
        return "Smart recommendation currently unavailable.";
    }
}

module.exports = { getGeminiRoomRecommendation };