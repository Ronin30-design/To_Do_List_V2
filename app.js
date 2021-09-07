//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");

const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-ragul:Test123@cluster0.4jf5h.mongodb.net/todolistDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema= new mongoose.Schema({
  name:String
});

const Item= mongoose.model("Item",itemsSchema);

const item1= new Item({
  name:"Welcome"
});

const item2= new Item({
  name:"Hit + to add item"
});

const item3= new Item({
  name:"<-- Hit to delete the item"
});

const defaultItems=[item1,item2,item3];

const listSchema= new mongoose.Schema({
      name:String,
      items:[itemsSchema]
});

const List = mongoose.model("List",listSchema);


// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log("Error");
//   }
//   else
//   {
//     console.log("Insert Success");
//   }
// });
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();
 Item.find({},function(err,founditems){
   if(founditems.length===0)
   {
     Item.insertMany(defaultItems,function(err){
       if(err){
         console.log("Error");
       }
       else
       {
         console.log("Insert Success");
       }
     });//will insert only if there are no default elements
     res.redirect("/");
   }
   else{
     res.render("list", {listTitle:"Today", newListItems: founditems});

   }

 });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName=req.body.list;

  const newitem= new Item({
    name:itemName
  });

  if(listName === "Today"){// if its the default list
    newitem.save();

    res.redirect("/");
  }else// if its the custom list
  {
    List.findOne({name:listName},function(err,foundList){// we find if there is any list object with that name and we push the data into its item
      foundList.items.push(newitem);
      foundList.save();
      res.redirect("/"+listName);// the route where the user came from
    })
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;

  const listName=req.body.listName;// to know from which list the element is getting deleted from

  if(listName === "Today"){//if its the default page then

    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log("error");
      }
      else{
        console.log("Delete success");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });//here we find the list by giving the listname and use $pull to deleted the item and update the array
  }


});

app.get("/:customListName",function(req,res){
  const customListName= req.params.customListName;

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //Create a new List
        const list= new List({
          name: customListName,
          items:defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
        //Show the existng lists
        res.render("list",{listTitle:foundList.name, newListItems: foundList.items});
      }
    }
  });


});
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully");
});
