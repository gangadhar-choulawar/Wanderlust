require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const flash = require("connect-flash");

async function initApp() {
    // 1. Database Connection
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("Connected to DB");

    // 2. Session Store Setup
    const store = MongoStore.create({
        mongoUrl: process.env.ATLASDB_URL,
        crypto: { secret: process.env.SECRET },
        touchAfter: 24 * 3600,
    });

    // 3. View Engine & Middlewares
    app.engine('ejs', ejsMate);
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use(session({ 
        store, 
        secret: process.env.SECRET, 
        resave: false, 
        saveUninitialized: true,
        cookie: {
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        }
    }));

    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    // 4. Global Local Variables
    app.use((req, res, next) => {
        res.locals.currUser = req.user;
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        next();
    });

    // 5. Routes
    app.get("/", (req, res) => {
        res.redirect("/listings");
    });

    const listingRouter = require("./routes/listing.js");
    const reviewRouter = require("./routes/review.js");
    const userRouter = require("./routes/user.js");

    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/", userRouter);

    // 6. Server Start
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`Server listening on port ${port}`));
}

// 7. Initialization Error Handling
initApp().catch(err => {
    console.error("FATAL INITIALIZATION ERROR:", err);
    process.exit(1);
});