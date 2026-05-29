const { GoogleGenerativeAI } = require("@google/generative-ai");
const Listing = require("../models/listing"); // Assuming you have this model

// Initialize the model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// ... include your other functions (createListing, showListing, etc.) here ...

module.exports.discover = async (req, res) => {
    try {
        const { location, country, prompt } = req.body;
        console.log("Attempting to connect to Gemini API...");
        
        const fullPrompt = `You are a travel expert. Tell me about ${location}, ${country}. ${prompt}`;
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        
        res.json({ answer: response.text() });
    } catch (err) {
        console.error("DEBUG - Gemini API Failure:", err.message);
        res.status(500).json({ error: "AI service unavailable." });
    }
};