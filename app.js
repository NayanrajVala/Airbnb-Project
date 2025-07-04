const express = require("express");
const { isloggedin, isowner, isauthor, savedredirecturl } = require("./utils/middlware.js");
const wrapsync = require("./utils/wrapsync.js");
const mongoose = require("mongoose");
const listingRouter = require('./routes/listing');
const path = require("path");
const methodoverride = require("method-override");
const cookieParser = require("cookie-parser");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const reviews = require("./routes/review.js");
const userrouter = require("./routes/user.js");
const paymentRoutes = require("./routes/paymentRoutes.js");

const app = express();

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsmate);
app.use(express.json()); 
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));

const sessionoptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionoptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages and current user middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.err = req.flash("error"); 
  res.locals.current = req.user;
  next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviews);
app.use("/", userrouter);
app.use("/listings/:id", paymentRoutes);

// Connect to MongoDB
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
  console.log("Connected to MongoDB");
}
main().catch((err) => console.error("MongoDB connection error:", err));

// 404 Error Handling
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Start server
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});