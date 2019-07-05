const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Campground = require("./models/campground");
const Comment = require("./models/comment");
const User = require("./models/user");
const seedDB = require("./seeds");

const commentRoutes = require("./routes/comments")

seedDB();
//passport configuration
app.use(require("express-session")({
    secret: "Hail Hydra",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

//a middleware that will run for EVERY ROUTES
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.get("/", function(req, res) {
    res.render("landing");
});

//Index route
app.get("/campgrounds", function(req, res) {
    //TODO: show data in the MONGODB
    console.log(req.user);
    Campground.find({}, function(err, allCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampground });
        }
    });
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
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    })
})


//Create campgrounds/:id/comments POST
app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res) {
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

// AUTH ROUTES //
//show REGISTER form
app.get("/register", function(req, res) {
    res.render("register");
});

//handle REGISTER logic
app.post("/register", function(req, res) {
    var newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register")
        }
        //user sign up - log in- authenticate - redirect
        passport.authenticate("local")(req, res, function() {
            res.redirect("/campgrounds");
        });
    });
});

// show LOGIN form
app.get("/login", function(req, res) {
    res.render("login");
})

//handle LOGIN logic => app.post("/",middleware, callback)
app.post("/login", passport.authenticate("local", {
    //if account exist in the DB
    successRedirect: "/campgrounds",
    //if account not exist
    failureRedirect: "/login"
}), function(req, res) {});

//LOGOUT route
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/campgrounds");
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function() {
    console.log("The Yelp Camp server started!");
});