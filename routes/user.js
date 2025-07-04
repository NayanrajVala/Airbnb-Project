const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapsync = require("../utils/wrapsync.js");
const { savedredirecturl } = require("../utils/middlware.js");
const passport = require("passport");
const usercontroller=require("../controllers/user.js")
//signup
router.get("/signup", (req, res) => {
  res.render("./signup.ejs");
});
router.post(
  "/signup",
  wrapsync(usercontroller.signup)
);
//login
router.get("/login", async (req, res) => {
  res.render("./login.ejs");
});
router.post(
  "/login",
  savedredirecturl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
 wrapsync(usercontroller.login)
);
//logout
router.get("/logout",usercontroller.logout);
module.exports = router;
