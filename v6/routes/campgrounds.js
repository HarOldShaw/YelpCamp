var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

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
router.get("/new", function(req, res) {
    res.render("campgrounds/new.ejs");
});

//Create route
router.post("/", function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = { name: name, image: image, description: desc }
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
            console.log(foundCampground);
            //render show template with the found campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

module.exports = router;