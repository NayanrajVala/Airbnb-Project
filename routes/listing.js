
const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapsync = require("../utils/wrapsync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { isloggedin, isowner } = require("../utils/middlware.js");
const { storage } = require("../cloudconfig.js");
const multer = require("multer");
const upload = multer({ storage });
const listingcontroller = require("../controllers/listings.js");

console.log("Loading routes/listing.js");
console.log("Imported modules:", {
  express: !!express,
  wrapsync: !!wrapsync,
  Listing: !!Listing,
  ExpressError: !!ExpressError,
  isloggedin: !!isloggedin,
  isowner: !!isowner,
  storage: !!storage,
  multer: !!multer,
  listingcontroller: Object.keys(listingcontroller)
});

router.get("/new", isloggedin, (req, res, next) => {
  console.log("GET /listings/new - Entering route");
  listingcontroller.rendernewform(req, res, next);
});

router
  .route("/")
  .get(wrapsync(async (req, res, next) => {
    console.log("GET /listings - Entering route");
    await listingcontroller.index(req, res, next);
  }))
  .post(
    isloggedin,
    upload.single("listings[image]"),
    wrapsync(async (req, res, next) => {
      console.log("POST /listings - Entering route, file:", req.file);
      await listingcontroller.createlisting(req, res, next);
    })
  );

router
  .route("/:id")
  .get(isloggedin, wrapsync(async (req, res, next) => {
    console.log(`GET /listings/${req.params.id} - Entering route`);
    await listingcontroller.showlisting(req, res, next);
  }))
  .put(
    isloggedin,
    isowner,
    upload.single("listings[image]"),
    wrapsync(async (req, res, next) => {
      console.log(`PUT /listings/${req.params.id} - Entering route, file:`, req.file);
      await listingcontroller.updatelisting(req, res, next);
    })
  )
  .delete(isloggedin, isowner, wrapsync(async (req, res, next) => {
    console.log(`DELETE /listings/${req.params.id} - Entering route`);
    await listingcontroller.deletelisting(req, res, next);
  }));

router.get("/:id/edit", isloggedin, isowner, wrapsync(async (req, res, next) => {
  console.log(`GET /listings/${req.params.id}/edit - Entering route`);
  await listingcontroller.rendereditform(req, res, next);
}));

module.exports = router;