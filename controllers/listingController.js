const Listing = require("../models/listing");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings, category: null, search: null });
};

module.exports.discover = async (req, res) => { /* logic */ };

module.exports.renderNewForm = (req, res) => { /* logic */ };

module.exports.createListing = async (req, res) => { /* logic */ };

module.exports.showListing = async (req, res) => { /* logic */ };

module.exports.renderEditForm = async (req, res) => { /* logic */ };

module.exports.updateListing = async (req, res) => { /* logic */ };

module.exports.destroyListing = async (req, res) => { /* logic */ };