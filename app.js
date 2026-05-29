console.log("DEBUG: Attempting to load routers...");

const listingRouter = require("./routes/listing.js");
console.log("DEBUG: Listing Router loaded. Type:", typeof listingRouter);

const reviewRouter = require("./routes/review.js");
console.log("DEBUG: Review Router loaded. Type:", typeof reviewRouter);

const userRouter = require("./routes/user.js");
console.log("DEBUG: User Router loaded. Type:", typeof userRouter);

// Only use if they are actually functions
if (typeof listingRouter === 'function') app.use("/listings", listingRouter);
if (typeof reviewRouter === 'function') app.use("/listings/:id/reviews", reviewRouter);
if (typeof userRouter === 'function') app.use("/", userRouter);