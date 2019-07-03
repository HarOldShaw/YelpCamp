const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
const seedDB = require("./seeds");


seedDB();
mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
    res.render("landing");
});

//Index route
app.get("/campgrounds", function(req, res) {
    // res.render("campgrounds", { campgrounds: campgrounds });
    //TODO: show data in the MONGODB
    Campground.find({}, function(err, allCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampground });
        }
    })
});

//New route
app.get("/campgrounds/new", function(req, res) {
    res.render("campgrounds/new.ejs");
});

//Create route
app.post("/campgrounds", function(req, res) {
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
app.get("/campgrounds/:id", function(req, res) {
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
//================
//Nested route for Comment (comment nested in campground)
//=================

//New campgrounds/:id/comments/new GET
app.get("/campgrounds/:id/comments/new", function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    })
})


//Create campgrounds/:id/comments POST
app.post("/campgrounds/:id/comments", function(req, res) {
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


app.listen(3000, function() {
    console.log("The Yelp Camp server started!");
});