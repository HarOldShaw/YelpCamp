// all middlewarer goes here
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middlewareObj = {
    checkCampgroundOwnership: function(req, res, next) {
        if (req.isAuthenticated()) {
            Campground.findOne({ slug: req.params.slug }, function(err, foundCampground) {
                if (err) {
                    req.flash("error", "Campground not found");
                    res.redirect("back");
                } else {
                    // check if user own the campground
                    if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                        next();
                    } else {
                        req.flash("error", "Permission denied");
                        res.redirect("back");
                    }
                };
            });
        } else {
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");
        }
    },
    checkCommentOwnership: function(req, res, next) {
        if (req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, function(err, foundComment) {
                if (err) {
                    res.redirect("back");
                } else {
                    // check if user own the campground
                    if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                        next();
                    } else {
                        req.flash("error", "You don't have permission to do that");
                        res.redirect("back");
                    }
                };
            });
        } else {
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");
        }
    },
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        // add flash first, then redirect
        req.flash("error", "You need to be logged in to do that");
        res.redirect("/login");
    }
}

module.exports = middlewareObj;