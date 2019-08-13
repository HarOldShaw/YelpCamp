const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware/index");
const multer = require('multer');
require('dotenv').config();

const storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
const imageFilter = function(req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter })

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dhdggqpjn',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



//Index route
router.get("/", function(req, res) {
    var noMatch;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ name: regex }, function(err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                if (allCampgrounds.length < 1) {
                    noMatch = "No campgrounds match that query, please try again";
                }
                res.render("campgrounds/index", { campgrounds: allCampgrounds, page: "campgrounds", noMatch: noMatch });
            }
        });
    } else {
        Campground.find({}, function(err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", { campgrounds: allCampgrounds, page: "campgrounds", noMatch: noMatch });
            }
        });
    }
});

//Create route
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        // add image's public_id to campground object
        req.body.campground.imageId = result.public_id;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        }
        Campground.create(req.body.campground, function(err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.slug);
        });
    });
});

//New route
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new.ejs");
});

//Show - show more info about one campground
router.get("/:slug", function(req, res) {
    //find the campground with the provided slug
    Campground.findOne({ slug: req.params.slug }).populate("comment likes").exec(function(err, foundCampground) {
        if (err) {
            console.log("error: " + err);
        } else {
            //render show template with the found campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});


//Edit Campground Route
router.get("/:slug/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findOne({ slug: req.params.slug }, function(err, foundCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", { campground: foundCampground });
        }
    });
});


//UPDATE Campground Route
router.put("/:slug", middleware.checkCampgroundOwnership, function(req, res) {
    //find and update the correct campground
    Campground.findOne({ slug: req.params.slug }, function(err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.image = req.body.campground.image;
            campground.save(function(err) {
                if (err) {
                    console.log("err:" + err);
                    res.redirect("/campgrounds");
                } else {
                    res.redirect("/campgrounds/" + campground.slug);
                }
            });
        }
    });
})

// DESTROY Campground Route
router.delete("/:slug", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findOneAndRemove({ slug: req.params.slug }, function(err) {
        if (err) {
            console.log("err in delete:" + err);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

//Campground Like Route
router.post("/:slug/like", middleware.isLoggedIn, function(req, res) {
    Campground.findOne({ slug: req.params.slug }, function(err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function(like) {
            return like.equals(req.user._id);
        })

        if (foundUserLike) {
            //user already like, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            //adding the new user like
            foundCampground.likes.push(req.user._id);
        }

        //save
        foundCampground.save(function(err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground.slug);
        });
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;