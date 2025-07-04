const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

console.log("Loading utils/middlware.js");
console.log("Imported modules:", {
  Listing: !!Listing,
  Review: !!Review,
  ExpressError: !!ExpressError
});

module.exports.isloggedin = (req, res, next) => {
  console.log("isloggedin - Checking authentication, user:", !!req.user);
  if (!req.isAuthenticated()) {
    req.session.yash = req.baseUrl + req.path;
    console.log("isloggedin - Not authenticated, redirecting to /login, saved URL:", req.session.yash);
    req.flash("error", "you must be logged in to create listing");
    return res.redirect("/login");
  }
  next();
};

module.exports.savedredirecturl = (req, res, next) => {
  console.log("savedredirecturl - Checking session.yash:", req.session.yash);
  if (req.session.yash) {
    res.locals.redirecturl = req.session.yash;
    console.log("savedredirecturl - Set redirecturl:", res.locals.redirecturl);
  }
  next();
};

module.exports.isowner = async (req, res, next) => {
  let { id } = req.params;
  console.log(`isowner - Checking ownership for listing ID: ${id}, user:`, req.user?._id);
  let listing = await Listing.findById(id);
  if (!listing) {
    console.log("isowner - Listing not found");
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  if (res.locals.current && !listing.owner._id.equals(res.locals.current._id)) {
    console.log("isowner - Not owner, redirecting");
    req.flash("error", "sorry you don't have access to edit!");
    return res.redirect(`/listings/${id}`);
  }
  console.log("isowner - Authorized");
  next();
};

module.exports.isauthor = async (req, res, next) => {
  let { id, reviewid } = req.params;
  console.log(`isauthor - Checking authorship for review ID: ${reviewid}, listing ID: ${id}, user:`, req.user?._id);
  let review = await Review.findById(reviewid);
  if (!review) {
    console.log("isauthor - Review not found");
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }
  if (res.locals.current && !review.owner._id.equals(res.locals.current._id)) {
    console.log("isauthor - Not author, redirecting");
    req.flash("error", "sorry you don't have access to edit!");
    return res.redirect(`/listings/${id}`);
  }
  console.log("isauthor - Authorized");
  next();
};