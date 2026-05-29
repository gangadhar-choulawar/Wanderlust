const Listing = require("../models/listing");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the core Google Generative AI client instance securely using your Render Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FIXED: Migrated to an active production model to fix the 404 endpoint rejection entirely
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Display all listings on the home dashboard
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings, category: null, search: null });
};

// Render specific listing page details accompanied by static AI-generated localized highlights
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    
    // 1. Fetch listing and populate its reviews
    const listing = await Listing.findById(id).populate("reviews");
    
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    
    // 2. Initialize a default string for template safety
    let aiRecommendations = "";

    try {
        // 3. Request tailored snapshot information from Gemini about this specific listing
        const aiPrompt = `You are a localized expert travel guide. The user is viewing a vacation listing titled "${listing.title}" located in "${listing.location}, ${listing.country}". Provide exactly 3 short, highly unique bullet points of local hidden gems, must-do activities, or local food recommendations right near this area. Keep it concise.`;
        
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        aiRecommendations = response.text();
    } catch (apiErr) {
        console.error("Gemini API Error in showListing:", apiErr);
        // Fallback text ensures your listing page still loads beautifully even if the API experiences network latency
        aiRecommendations = "• Local travel tips are temporarily unavailable. Enjoy your stay!";
    }
    
    // 4. Pass 'aiRecommendations' right into your EJS template alongside the listing object
    res.render("listings/show.ejs", { listing, aiRecommendations });
};

// Render form to register a new vacation rental property
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Save a newly submitted listing to MongoDB Atlas
module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect(`/listings/${newListing._id}`);
};

// Render the modification layout view for owners
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
};

// Commit property updates to the database instance
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
};

// Permanently drop a listing from the collection
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
};

// FEATURE ROUTE: Handles real-time text input queries from the interactive EJS chat console widget via absolute routing
module.exports.discover = async (req, res) => {
    try {
        const { location, country, prompt } = req.body;
        
        // 1. Generate text streams using the synced global model assignment
        const result = await model.generateContent(`Tell me about ${location}, ${country}. ${prompt}`);
        
        // 2. Resolve internal response values securely
        const response = await result.response;
        const aiText = response.text();
        
        // 3. Return a clean payload back to the awaiting client-side script window
        res.json({ answer: aiText });
    } catch (err) {
        console.error("CRITICAL ERROR IN DISCOVER ROUTE:", err);
        
        // Return raw message diagnostic tracking context directly inside the browser window on failure
        res.status(500).json({ 
            error: "AI service unavailable.",
            details: err.message || err.toString()
        });
    }
};