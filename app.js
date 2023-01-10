//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require("ejs");
const _= require("lodash")
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connecting Databases
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://Shubham9709:Forgot_password@cluster0.imzwrf7.mongodb.net/todoList",{useNewUrlParser:true});

const itemsSchema ={
  name: "String"
};
const Item = mongoose.model("Item",itemsSchema);
const item1= new Item({
  name: "Welcome to the todoList!"
});

const item2= new Item({
  name: "Hit the + button to add a new item"
});

const item3= new Item({
  name: "<---- Hit it to strike off an item"
});

const defaultItems=[item1,item2,item3];

// Making random pages by users in database

const listSchems={
  name: "String",
  items: [itemsSchema]
};

const List=mongoose.model("List",listSchems);

app.get("/", function(req, res) {

// const day = date.getDate();
Item.find({},function(err,foundItems){
  if(foundItems.length ===0)
  {
    Item.insertMany(defaultItems,function(err)
    {
      if(err)
      {
        console.log(err);
      }
      else {
        console.log("Successfully inserted into the database");
      }
    });
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});


});

app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;
  List.findOne({name: customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        const list=new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle: foundList.name ,newListItems:foundList.items});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = _.capitalize(req.body.list);
  const item= new Item({
    name: itemName,
  });

  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){

        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);

    });
  }

});

app.post("/delete",function(req,res){
  const checkedItemsId=req.body.checkbox;
  const listName = req.body.list;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemsId,function(err){
      if(err)
      {
        console.log(err);
      }else{
        console.log("Successfully deleted");
        res.redirect("/"); 4
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedItemsId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
