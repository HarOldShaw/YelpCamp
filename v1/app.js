const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

var campgrounds = [
    { name: "Baiyun Mountain", image: "https://cdn.pixabay.com/photo/2014/11/27/18/36/tent-548022_960_720.jpg" },
    { name: "Bevery Hill", image: "https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201__340.jpg" },
    { name: "Hollywood", image: "https://cdn.pixabay.com/photo/2016/11/22/23/08/adventure-1851092__340.jpg" },
    { name: "Disney Land", image: "https://cdn.pixabay.com/photo/2015/07/10/17/24/night-839807__340.jpg" }
]

app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/campgrounds", function(req, res) {
    res.render("campgrounds", { campgrounds: campgrounds });
    //TODO: show data in the MONGODB
});

app.get("/campgrounds/new", function(req, res) {
    res.render("new.ejs");
});

app.post("/campgrounds", function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var newCampground = { name: name, image: image }
    campgrounds.push(newCampground);
    //TODO: to push data into MongoDB
    res.redirect("/campgrounds")
        //get data from form and add to campgroudns array
        //redirect page back to campgrounds
})


app.listen(3000, function() {
    console.log("The Yelp Camp server started!");
});