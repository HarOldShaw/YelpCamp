// all middlewarer goes here
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const Review = require("../models/review");
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
    checkReviewOwnership: function(req, res, next) {
        if (req.isAuthenticated()) {
            Review.findById(req.params.review_id, function(err, foundReview) {
                if (err || !foundReview) {
                    res.redirect("back");
                } else {
                    // does user own the comment?
                    if (foundReview.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        req.flash("error", "You don't have permission to do that");
                        res.redirect("back");
                    }
                }
            });
        } else {
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");
        }
    },
    checkReviewExistence: function(req, res, next) {
        if (req.isAuthenticated()) {
            Campground.findOne({ slug: req.params.slug }).populate("reviews").exec(function(err, foundCampground) {
                if (err || !foundCampground) {
                    req.flash("error", "Campground not found.");
                    res.redirect("back");
                } else {
                    // check if req.user._id exists in foundCampground.reviews
                    var foundUserReview = foundCampground.reviews.some(function(review) {
                        return review.author.id.equals(req.user._id);
                    });
                    if (foundUserReview) {
                        req.flash("error", "You already wrote a review.");
                        return res.redirect("/campgrounds/" + foundCampground._id);
                    }
                    // if the review was not found, go to the next middleware
                    next();
                }
            });
        } else {
            req.flash("error", "You need to login first.");
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