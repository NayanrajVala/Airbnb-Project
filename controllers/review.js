const Listing = require("../models/listing");
const Review = require("../models/review");
module.exports.createreview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newreview = new Review(req.body.review);
  newreview.owner = req.user._id;
  listing.reviews.push(newreview);
  console.log(newreview);
  await newreview.save();
  await listing.save();

  res.redirect(`/listings/${listing.id}`);
};

module.exports.deletereview = async (req, res) => {
  let { id, reviewid } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
  await Review.findById(reviewid);
  req.flash("success", " review deleted successfully!");
  res.redirect(`/listings/${id}`);
};
