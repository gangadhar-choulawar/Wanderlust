const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ListingController = require("../controllers/listingController.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Routes
router.post("/discover", wrapAsync(ListingController.discover));
router.get("/", wrapAsync(ListingController.index));
// ... define all other routes here ...

module.exports = router; // THIS IS THE ONLY EXPORT YOU NEED HERE
