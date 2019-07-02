const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/cat_app", { useNewUrlParser: true });

var catSchema = new mongoose.Schema({
    name: String,
    age: Number,
    temperament: String
});

//take the cat schema and compile it to a model called "Cat" (singular version) in the database
var Cat = mongoose.model("Cat", catSchema);

//add a new cat to the DB

//save data into a variable
// var newCat = new Cat({
//     name: "Jerry",
//     age: 7,
//     temperament: "Cute"
// });

// newCat.save(function(error, cat) {
//     if (error) {
//         console.log("something went wrong!");
//     } else {
//         console.log("New cat added");
//         console.log(cat);
//     }
// });


Cat.create({
    name: "Tom",
    age: 14,
    temperament: "Stupid"
}, function(err, cat) {
    if (err) {
        console.log(err);
    } else {
        console.log("new cat:" + cat);
    }
});


//retrieve all cats from the DB and console.log each one

Cat.find({}, function(err, cat) {
    if (err) {
        console.log("No, error shows");
        console.log(err);
    } else {
        console.log("cats are listed below:");
        console.log(cat)
    }
});