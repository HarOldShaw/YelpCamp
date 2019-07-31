const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user");
const Campground = require("../models/campground");
const nodemailer = require("nodemailer");
const async = require("async");
const crypto = require("crypto");
require('dotenv').config();

// Root route
router.get("/", function(req, res) {
    res.render("landing");
});


// AUTH ROUTES //
//show REGISTER form
router.get("/register", function(req, res) {
    res.render("register", { page: "register" });
});

//handle REGISTER logic
router.post("/register", function(req, res) {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    if (req.body.adminCode === 'Harold123') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.render("register", { error: err.message });
        }
        //user sign up - log in- authenticate - redirect
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcomne to YelpCamp, " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// show LOGIN form
router.get("/login", function(req, res) {
    res.render("login", { page: "login" });
});

//handle LOGIN logic => app.post("/",middleware, callback)
router.post("/login", passport.authenticate("local", {
    //if account exist in the DB
    successRedirect: "/campgrounds",
    //if account not exist
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome to Yelpcamp!"
}), function(req, res) {});

//LOGOUT route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
})

//FORGET password
router.get("/forgot", function(req, res) {
    res.render("forgot");
})

router.post("/forgot", function(req, res, next) {
    console.log("Test")
        // Runs an array of functions in series, each passing their results to the next in the array. However, if any of the functions pass an error to the callback, the next function is not executed and the main callback is immediately called with the error.
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            })
        },
        function(token, done) {
            //judge the email user provided matches any account stored in the database
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                //assign user token and expire dates
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'haoru.xiao@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'haoru.xiao@gmail.com',
                subject: 'YelpCamp Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    console.log("error sending mail: " + err);
                } else {
                    console.log('mail sent');
                    req.flash('success', 'An email has been sent to ' + user.email + ' with further instructions');
                    done(err, 'done');
                }
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', { token: req.params.token });
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                host: "smtp.gmail.com",
                auth: {
                    type: 'login',
                    user: 'haoruxiao@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'learntocodeinfo@mail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/campgrounds');
    });
});


//USER PROFILE
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
        if (err) {
            console.log("something went wrong" + err);
            res.redirect("/");
        } else {
            Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
                if (err) {
                    req.flash("error", "something went wrong.");
                    res.redirect("back");
                }
                res.render("users/show", { user: foundUser, campgrounds: campgrounds });
            })
        }
    });
})

module.exports = router;