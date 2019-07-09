const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware/index");



//Index route
router.get("/", function(req, res) {
    //TODO: show data in the MONGODB
    Campground.find({}, function(err, allCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampground });
        }
    });
});

//New route
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new.ejs");
});

//Create route
router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = { name: name, image: image, description: desc, price: price, author: author };

    //Create a new campground and save to DB
    Campground.create(newCampground, function(err, newCampground) {
        if (err) {
            console.log(err);
        } else {
            console.log("new campground created");
            console.log(newCampground);

        }
    });
    res.redirect("/campgrounds");
    //get data from form and add to campgrounds array
    //redirect page back to campgrounds
})

//Show - show more info about one campground
router.get("/:id", function(req, res) {
    //find the campground with the provided id
    Campground.findById(req.params.id).populate("comment").exec(function(err, foundCampground) {
        if (err) {
            console.log("error: " + err);
        } else {
            //render show template with the found campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});


//Edit Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", { campground: foundCampground });
        }
    });
});


//UPDATE Campground Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    //redirect somewhere(show page)
})

// DESTROY Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;