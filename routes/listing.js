const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ListingController = require("../controllers/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Index Route
router.get("/", wrapAsync(ListingController.index));

// New & Create Route
router.get("/new", isLoggedIn, ListingController.renderNewForm);
router.post("/", isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(ListingController.createListing));

// Show, Update, Delete Routes
router.route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(ListingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.renderEditForm));

// AI Discover Route
router.post("/:id/discover", wrapAsync(ListingController.discover));

module.exports = router;