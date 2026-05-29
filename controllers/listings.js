module.exports.discover = async (req, res) => {
    try {
        const { location, country, prompt } = req.body;
        console.log("Attempting to connect to Gemini API...");
        
        const fullPrompt = `You are a travel expert...`;
        
        // This is where it likely fails
        const result = await model.generateContent(fullPrompt);
        
        res.json({ answer: result.response.text() });
    } catch (err) {
        console.error("DEBUG - Gemini API Failure:", err.message);
        res.status(500).json({ error: "AI service unavailable. Please check logs." });
    }
};