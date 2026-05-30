const Listing = require("../models/listing");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the core Google Generative AI client instance securely using your Render Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configured to Google's standard flagship production model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Display all listings on the home dashboard
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings, category: null, search: null });
};

// Render specific listing page details cleanly without page-load API blocks
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    console.log("=== DEBUG STEP 1: Route Entered successfully with ID:", id);
    
    try {
        console.log("=== DEBUG STEP 2: Requesting Mongoose to find listing and populate...");
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" }
            })
            .populate("owner");
            
        console.log("=== DEBUG STEP 3: Mongoose successfully returned listing:", listing ? listing.title : "NULL");
        
        if (!listing) {
            req.flash("error", "Listing does not exist!");
            return res.redirect("/listings");
        }

        if (!listing.owner) {
            listing.owner = { username: "Anonymous Host" };
        }
        
        console.log("=== DEBUG STEP 4: Attempting to render listings/show.ejs...");
        res.render("listings/show.ejs", { listing, aiRecommendations: "" });
        console.log("=== DEBUG STEP 5: res.render completed cleanly!");

    } catch (dbErr) {
        console.error("=== DEBUG CRITICAL DATABASE ERROR ===", dbErr);
        req.flash("error", "Something went wrong loading this listing profile.");
        res.redirect("/listings");
    }
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