var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var data = [{
        name: "Cloud Rest",
        image: "https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "good scenary"
    },
    {
        name: "Peace Lake",
        image: "https://images.unsplash.com/photo-1552528366-608e1b2f60cb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Peaceful"
    },
    {
        name: "Evergreen mountain",
        image: "https://images.unsplash.com/photo-1535049883634-993346531df6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Green trees all over the mountain"
    }
]

function seedDB() {
    Campground.remove({}, function(err) {
        if (err) {
            console.log(err);
        }
        Comment.remove({}, function(err) {
            if (err) {
                console.log("err removing commments");
            }
            console.log("remove all comments")
        });
        //add a few campgrounds
        data.forEach(function(seed) {
            Campground.create(seed, function(err, campground) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("added a campground");
                    //create a comment on each campground
                    Comment.create({
                        text: "This place is great!!!",
                        author: "Harold"
                    }, function(err, comment) {
                        if (err) {
                            console.log(err);
                        } else {
                            campground.comment.push(comment);
                            campground.save();
                            console.log("Created new comment")
                        }
                    })
                }
            });
        });
    });
}
module.exports = seedDB;