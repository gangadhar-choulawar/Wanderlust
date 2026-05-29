// 1. Initializations first
const express = require("express");
const app = express(); // <--- app must be defined here first

// 2. Then require the routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// 3. Now perform your debug/use logic
console.log("DEBUG: Listing Router loaded. Type:", typeof listingRouter);
app.use("/listings", listingRouter);

console.log("DEBUG: Review Router loaded. Type:", typeof reviewRouter);
app.use("/listings/:id/reviews", reviewRouter);

console.log("DEBUG: User Router loaded. Type:", typeof userRouter);
app.use("/", userRouter);