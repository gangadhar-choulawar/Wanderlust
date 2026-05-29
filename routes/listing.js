const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ListingController = require("../controllers/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
// ... other imports ...

// Place AI route HERE to avoid being caught by /:id
router.post("/discover", wrapAsync(ListingController.discover));

// Other routes...
router.get("/", wrapAsync(ListingController.index));
router.get("/new", isLoggedIn, ListingController.renderNewForm);
router.post("/", isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(ListingController.createListing));

router.route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(ListingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));

module.exports = router;