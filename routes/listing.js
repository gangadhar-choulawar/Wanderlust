const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ListingController = require("../controllers/listingController.js");

// DIAGNOSTIC LOG: This will print the contents of your controller to the logs
console.log("DEBUG: Controller contents:", Object.keys(ListingController));

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// AI Route
router.post("/discover", wrapAsync(ListingController.discover));

// Other Routes
router.get("/", wrapAsync(ListingController.index));
// Remove any other exports and use this block at the very end
module.exports = {
    index: module.exports.index,
    discover: module.exports.discover,
    // Add all your other functions here
    createListing: module.exports.createListing,
    showListing: module.exports.showListing,
    updateListing: module.exports.updateListing,
    destroyListing: module.exports.destroyListing,
    renderNewForm: module.exports.renderNewForm,
    renderEditForm: module.exports.renderEditForm
};