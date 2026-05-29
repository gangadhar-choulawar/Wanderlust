const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ListingController = require("../controllers/listingController.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// Index Route
router.get("/", wrapAsync(ListingController.index));

// New Route (Must be before /:id)
router.get("/new", isLoggedIn, ListingController.renderNewForm);

// Show Route
router.get("/:id", wrapAsync(ListingController.showListing));

// Create Route
router.post("/", isLoggedIn, validateListing, wrapAsync(ListingController.createListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));

// Update Route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(ListingController.updateListing));

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));

// AI Discover Route
router.post("/discover", wrapAsync(ListingController.discover));

module.exports = router;