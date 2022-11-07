const isLoggedIn = (req, res, next) => {
    //makes sure the user is logged in
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };

  module.exports = {
    isLoggedIn,
  }