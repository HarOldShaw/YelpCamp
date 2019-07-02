const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
})

var Campground = mongoose.model("Campground", campgroundSchema);


// Campground.create({
//     name: "Bevery Hill",
//     image: "https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201__340.jpg",
//     description: "Beautiful scenary"
// }, function(err, campground) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Newly created Campground:");
//         console.log(campground);
//     }
// });

// Campground.find({}, function(err, campground) {
//     if (err) {
//         console.log("No, error shows");
//         console.log(err);
//     } else {
//         console.log("campgrounds are listed below:");
//         console.log(campground)
//     }
// });




app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/campgrounds", function(req, res) {
    // res.render("campgrounds", { campgrounds: campgrounds });
    //TODO: show data in the MONGODB
    Campground.find({}, function(err, allCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", { campgrounds: allCampground });
        }
    })
});

app.get("/campgrounds/new", function(req, res) {
    res.render("new.ejs");
});

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
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            //render show template with the found campground
            res.render("show", { campground: foundCampground });
        }
    });
});

app.listen(3000, function() {
    console.log("The Yelp Camp server started!");
});