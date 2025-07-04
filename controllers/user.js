
const User = require("../models/user.js");

module.exports.signup = async (req, res) => {
  try {
    let { username, password, email } = req.body;
    let newuser = new User({
      username,
      email,
    });
    const registered = await User.register(newuser, password);

    req.login(registered, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "welcome to wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};
module.exports.login = async (req, res) => {
  if (res.locals.redirecturl) {
    return res.redirect(res.locals.redirecturl);
  }
  res.redirect("/listings");
  req.flash("success", "welcome back to wanderlust!");
};
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};
