const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const { GoogleGenerativeAI } = require("@google/generative-ai");

// DEBUG: Confirm the key is loaded
console.log("Environment API Key exists:", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use a stable, generally available model
// This name is likely incorrect/unsupported
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
router.post("/:id/discover", wrapAsync(async (req, res) => {
    const { location, country, prompt } = req.body;

    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined in the environment.");
        }

        const fullPrompt = `You are a travel expert for the Wanderlust app. 
        The user is currently viewing a property in ${location}, ${country}. 
        Answer the following request based on your knowledge of that area: "${prompt}". 
        Be specific, mention famous spots, and keep it helpful.`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });
    } catch (error) {
        console.error("Gemini Error:", error.message);
        res.status(500).json({ error: "AI Assistant is currently unavailable." });
    }
}));

// ... rest of your route definitions remain the same