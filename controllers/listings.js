const Listing = require("../models/listing.js");
const wrapsync = require("../utils/wrapsync.js");

console.log("Loading controllers/listings.js");
console.log("Imported modules:", { Listing: !!Listing, wrapsync: !!wrapsync });

module.exports.index = async (req, res) => {
  console.log("index - Fetching all listings");
  const data = await Listing.find();
  console.log("index - Found listings:", data.length);
  res.render("index.listings.ejs", { data });
};

module.exports.rendernewform = (req, res) => {
  console.log("rendernewform - Rendering new form");
  res.render("new.listings.ejs");
};

module.exports.showlisting = async (req, res, next) => {
  try {
    let { id } = req.params;
    console.log(`showlisting - Fetching listing ID: ${id}`);
    const list = await Listing.findById(id)
      .populate({ path: 'reviews', populate: { path: 'owner' } })
      .populate('owner');
    console.log("showlisting - Listing found:", !!list, list ? { title: list.title, price: list.price } : null);
    if (!list) {
      console.log("showlisting - Listing not found");
      req.flash('error', 'Listing not found!');
      return res.redirect('/listings');
    }
    if (typeof list.price !== 'number' || isNaN(list.price) || list.price <= 0) {
      console.error('showlisting - Invalid price for listing:', list._id, list.price);
      req.flash('error', 'Invalid listing price');
      return res.redirect('/listings');
    }
    const messages = {
      success: req.flash('success'),
      err: req.flash('error')
    };
    console.log('showlisting - Flash messages:', messages);
    console.log('showlisting - Query:', req.query);
    if (req.query.payment === 'success') {
      console.log('showlisting - Payment success detected');
      req.flash('success', 'Booked successfully!');
    }
    console.log('showlisting - Rendering show.listings.ejs with price:', list.price);
    res.render('showlistings.ejs', { list, current: req.user, messages, session: req.session });
    console.log('showlisting - Render completed');
  } catch (err) {
    console.error("showlisting - Error:", err.message, err.stack);
    next(err);
  }
};

module.exports.createlisting = async (req, res, next) => {
  try {
    console.log("createlisting - Creating new listing, body:", req.body.listings);
    let url = req.file.path;
    let filename = req.file.filename;

    let listing = new Listing(req.body.listings);
    listing.image = { url, filename };
    listing.owner = req.user._id;

    console.log("createlisting - New listing:", listing);
    await listing.save();

    req.flash("success", "New listing Created");
    console.log("createlisting - Redirecting to:", `/listings/${listing._id}`);
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("createlisting - Error:", err.message, err.stack);
    next(err);
  }
};

module.exports.rendereditform = async (req, res) => {
  console.log("rendereditform - Fetching listing ID:", req.params.id);
  let { id } = req.params;
  const list = await Listing.findById(id);
  console.log("rendereditform - Listing found:", !!list);
  if (!list) {
    req.flash('error', 'Listing not found!');
    return res.redirect('/listings');
  }
  let photo = list.image.url;
  photo = photo.replace("/upload", "/upload/h_300");
  console.log("rendereditform - Rendering edit form with photo:", photo);
  res.render("edit.listings.ejs", { list, photo });
};

module.exports.updatelisting = async (req, res) => {
  console.log("updatelisting - Updating listing ID:", req.params.id);
  if (!req.body.listings) {
    console.error("updatelisting - Invalid data");
    throw new ExpressError(400, "send valid data for listing");
  }
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listings });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    console.log("updatelisting - Updated image:", listing.image);
    await listing.save();
  }
  console.log("updatelisting - Listing updated");
  req.flash("success", "listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.deletelisting = async (req, res) => {
  console.log("deletelisting - Deleting listing ID:", req.params.id);
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  console.log("deletelisting - Listing deleted");
  req.flash("success", "listing deleted successfully!");
  res.redirect("/listings");
};