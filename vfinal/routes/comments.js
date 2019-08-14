const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware/index");

//================
//Nested route for Comment (comment nested in campground)
//=================

//Comment new form
router.get("/new", middleware.isLoggedIn, function(req, res) {
    console.log(req.params.slug);
    Campground.findOne({ slug: req.params.slug }, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    })
})


//Create campgrounds/:slug/comments POST
router.post("/", middleware.isLoggedIn, function(req, res) {
    //lookup campground using slug
    Campground.findOne({ slug: req.params.slug }, function(err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds")
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong with this comment");
                    console.log(err);
                } else {
                    // add user name and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    // connect new comment to campground
                    campground.comment.push(comment);
                    campground.save();
                    console.log("comment: " + comment);
                    //redirect campground page
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground.slug);
                }
            });
        }
    });
});


// Comment EDIT Route 
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", { campground_slug: req.params.slug, comment: foundComment });
        }
    })
});


// Comment UPDATE Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.slug);
        }
    })
})


// Comment DELETE Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.slug);
        }
    });
});

module.exports = router;