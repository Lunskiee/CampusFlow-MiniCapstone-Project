const { GoogleGenAI } = require('@google/genai');

const isPlaceholderValue = (value) => {
    if (typeof value !== 'string') return false;
    const normalized = value.trim();
    return normalized === '' || /your[_ -]?(actual|api|gemini)|example|placeholder|change_me|<.*>/i.test(normalized);
};

const hasValidGeminiKey = () => {
    const key = process.env.GEMINI_API_KEY;
    return typeof key === 'string' && key.trim() !== '' && !isPlaceholderValue(key);
};

const getGeminiClient = () => {
    if (!hasValidGeminiKey()) {
        return null;
    }

    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

async function getGeminiRoomRecommendation(roomName, period, date) {
    try {
        const ai = getGeminiClient();
        if (!ai) {
            return "Gemini API key is missing or invalid in .env. Add a valid Google AI Studio API key to enable smart recommendations.";
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