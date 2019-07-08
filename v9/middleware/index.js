// all middlewarer goes here
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middlewareObj = {
    checkCampgroundOwnership: function(req, res, next) {
        if (req.isAuthenticated()) {
            Campground.findById(req.params.id, function(err, foundCampground) {
                if (err) {
                    res.redirect("back");
                } else {
                    // check if user own the campground
                    if (foundCampground.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        res.redirect("back");
                    }
                };
            });
        } else {
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
                    if (foundComment.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        res.redirect("back");
                    }
                };
            });
        } else {
            res.redirect("back");
        }
    },
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/login");
    }
}

module.exports = middlewareObj;