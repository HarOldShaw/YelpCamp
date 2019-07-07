const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const Comment = require("../models/comment");


//================
//Nested route for Comment (comment nested in campground)
//=================

//Comment new form
router.get("/new", isLoggedIn, function(req, res) {
    console.log(req.params.id);
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    })
})


//Create campgrounds/:id/comments POST
router.post("/", isLoggedIn, function(req, res) {
    //lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds")
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    // add user name and id to comment
                    comment.author.id = req.user._id;
                    comment.save();
                    comment.author.username = req.user.username;
                    // connect new comment to campground
                    campground.comment.push(comment);
                    campground.save();
                    //redirect campground page      
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});


// Comment EDIT Route /campgrounds/:id/comments/:comment_id/edit
router.get("/:comment_id/edit", function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", { campground_id: req.params.id, comment: foundComment });
        }
    })
});


// Comment Update Route /campgrounds/:id/comments/:comment_id/edit
router.put("/:comment_id", function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" +
                req.params.id);
        }
    })
})



//middle ware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;