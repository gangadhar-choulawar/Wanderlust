// ... [Your imports at the top] ...

async function initApp() {
    // 1. Database Connection
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("Connected to DB");

    // 2. Session Store
    const store = MongoStore.create({
        mongoUrl: process.env.ATLASDB_URL,
        crypto: { secret: process.env.SECRET },
        touchAfter: 24 * 3600,
    });

    // 3. Middlewares
    app.engine('ejs', ejsMate);
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // --- SINGLE SESSION MIDDLEWARE BLOCK ---
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
    // ---------------------------------------

    app.use(passport.initialize());
    app.use(passport.session());

    // 4. Routers
    const listingRouter = require("./routes/listing.js");
    const reviewRouter = require("./routes/review.js");
    const userRouter = require("./routes/user.js");

    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/", userRouter);

    // 5. Start Server
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`Server listening on port ${port}`));
}

// EXECUTION
initApp().catch(err => {
    console.error("FATAL INITIALIZATION ERROR:", err);
    process.exit(1);
});