const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
    initDB(); 
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    
    // 1. Assign an owner
    // 2. Assign a default category (so filters don't appear empty)
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "698334fae4535c594418f488",
      category: "Trending", // Providing a default value from your enum
    }));

    await Listing.insertMany(initData.data);
    console.log("Data was successfully initialized with categories!");
  } catch (err) {
    console.log("Error initializing data:", err);
  }
};