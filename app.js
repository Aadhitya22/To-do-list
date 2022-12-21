const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
});

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
  name: "Welcome to your To-Do list!",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "⬅️ Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  var today = new Date();
  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  var day = today.toLocaleDateString("en-US", options);
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { kindOfDay: day, newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName,
  });
  item.save();
  res.redirect("/");
});

app.post("/delete", function (req, res) {
  const checkedItemID = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemID, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully deleted checked item");
      res.redirect("/");
    }
  });
});

app.listen(3000, function () {
  console.log("Server is up and running on port 3000");
});
