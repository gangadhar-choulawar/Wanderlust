const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use stable version

router.post("/:id/discover", wrapAsync(async (req, res) => {
    const { location, country, prompt } = req.body;
    try {
        const fullPrompt = `You are a travel expert for the Wanderlust app. The user is in ${location}, ${country}. Answer: "${prompt}".`;
        const result = await model.generateContent(fullPrompt);
        res.json({ answer: result.response.text() });
    } catch (error) {
        console.error("Gemini Error:", error.message);
        res.status(500).json({ error: "AI Assistant unavailable." });
    }
}));

// Add all your other routes here (index, show, update, delete)
// ...

// MANDATORY EXPORT
module.exports = router;