const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user");

// Roo.t route
router.get("/", function(req, res) {
    res.render("landing");
});


// AUTH ROUTES //
//show REGISTER form
router.get("/register", function(req, res) {
    res.render("register");
});

//handle REGISTER logic
router.post("/register", function(req, res) {
    var newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register")
        }
        //user sign up - log in- authenticate - redirect
        passport.authenticate("local")(req, res, function() {
            res.redirect("/campgrounds");
        });
    });
});

// show LOGIN form
router.get("/login", function(req, res) {
    res.render("login");
})

//handle LOGIN logic => app.post("/",middleware, callback)
router.post("/login", passport.authenticate("local", {
    //if account exist in the DB
    successRedirect: "/campgrounds",
    //if account not exist
    failureRedirect: "/login"
}), function(req, res) {});

//LOGOUT route
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/campgrounds");
})

// middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;