const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// AI Integration
// --- AI Integration ---
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/** * UPDATED FOR MAY 2026:
 * Use "gemini-3.1-flash-lite" (Stable) 
 * OR "gemini-3-flash-preview" (Preview)
 */
const model = genAI.getGenerativeModel({ model:"gemini-3.1-flash-lite" });
// --- AI Discovery Route (Free Internal Knowledge Only) ---
router.post("/:id/discover", wrapAsync(async (req, res) => {
    const { location, country, prompt } = req.body;

    try {
        // Constructing a prompt that forces Gemini to use its training data about the location
        const fullPrompt = `You are a travel expert for the Wanderlust app. 
        The user is currently viewing a property in ${location}, ${country}. 
        Answer the following request based on your knowledge of that area: "${prompt}". 
        Be specific, mention famous spots, and keep it helpful.`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "AI Assistant is currently unavailable." });
    }
}));

// --- Standard Listing Routes ---

router.route("/")
    .get(wrapAsync(ListingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(ListingController.createListing)
    );

router.get("/new", isLoggedIn, ListingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(ListingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));

module.exports = router;