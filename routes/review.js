const express=require("express")
const router=express.Router({mergeParams:true});
const wrapsync=require("../utils/wrapsync.js")
const Listing=require("../models/listing.js")
const ExpressError=require("../utils/ExpressError.js");
const {isloggedin,isowner,isauthor}=require("../utils/middlware.js")
const {listingSchema,reviewSchema}=require("../models/listing.js")
const reviewcontrollers=require("../controllers/review.js")
router.post("/",isloggedin,wrapsync(reviewcontrollers.createreview))
//delete reviews
router.delete("/:reviewid",isloggedin,isauthor,wrapsync(reviewcontrollers.deletereview))
module.exports=router;