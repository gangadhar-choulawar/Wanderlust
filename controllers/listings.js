const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports.discover = async (req, res) => {
    try {
        const { location, country, prompt } = req.body;
        console.log("Attempting to connect to Gemini API...");
        
        const fullPrompt = `You are a travel expert...`;
        
        const result = await model.generateContent(fullPrompt);
        
        res.json({ answer: result.response.text() });
    } catch (err) {
        console.error("DEBUG - Gemini API Failure:", err.message);
        res.status(500).json({ error: "AI service unavailable." });
    }
};