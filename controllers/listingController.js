const Listing = require("../models/listing");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings, category: null, search: null });
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    
    // 1. Fetch listing and populate its reviews
    const listing = await Listing.findById(id).populate("reviews");
    
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    
    // 2. Initialize a default string for safety
    let aiRecommendations = "";

    try {
        // 3. Request tailored information from Gemini about this specific listing
        const aiPrompt = `You are a localized expert travel guide. The user is viewing a vacation listing titled "${listing.title}" located in "${listing.location}, ${listing.country}". Provide exactly 3 short, highly unique bullet points of local hidden gems, must-do activities, or local food recommendations right near this area. Keep it concise.`;
        
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        aiRecommendations = response.text();
    } catch (apiErr) {
        console.error("Gemini API Error in showListing:", apiErr);
        // Fallback text so your page still loads beautifully even if the API quota drops
        aiRecommendations = "• Local travel tips are temporarily unavailable. Enjoy your stay!";
    }
    
    // 4. Pass 'aiRecommendations' right into your EJS template alongside the listing object
    res.render("listings/show.ejs", { listing, aiRecommendations });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
};

module.exports.discover = async (req, res) => {
    try {
        const { location, country, prompt } = req.body;
        const result = await model.generateContent(`Tell me about ${location}, ${country}. ${prompt}`);
        res.json({ answer: result.response.text() });
    } catch (err) {
        res.status(500).json({ error: "AI service unavailable." });
    }
};