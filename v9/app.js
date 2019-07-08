const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/user");
const seedDB = require("./seeds");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");

// requiring routes
const commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
// seedDB(); //seed the database

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

//a middleware that will run for EVERY ROUTES, for every routes, currentUser is available
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

//use the routes in the route file
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(3000, function() {
    console.log("The Yelp Camp server started!");
});