
const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose= require('mongoose')
const _=require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});
const itemSchema=new mongoose.Schema({
  name:String
});
const Item= mongoose.model("Item",itemSchema);

const clean =new Item({
  name:"Cleaning"
});
const market= new Item({
  name:"Go to the market"

});
const read =new Item({
  name:"Sit down and read"
});

const defaultItems=[clean,market,read]

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const List= mongoose.model("List",listSchema);

//const day = date.getDate();

app.get("/", function(req, res) {
  Item.find({},function(err,results){
    if(results.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err)
        }else{
          console.log("Items successfully uploaded")
        }
      });
      res.redirect("/");
    }


    else{
      res.render("list",{listTitle:"Today",newListItems:results});

    }

  })

});

  
 



app.post("/", function(req, res){

  const itemName= req.body.newItem;
  const listName=req.body.list

  const item=new Item({
    name:itemName
  })

  if(listName==="Today"){
    
      item.save()
      res.redirect("/")

  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" +listName)
      

    })
  }



  
});
app.post("/delete",function(req,res){
  const checkedItem=req.body.checkbox
  const listName=req.body.listName

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(!err){
        console.log("Successfully deleted item")
        res.redirect("/")
      }
     
      
    })

  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName)
      }

    })

  }






})
app.get("/:title",function(req,res){
  const customName=_.capitalize(req.params.title)

  List.findOne({name:customName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customName,
          items:defaultItems
        })
       list.save()
       res.redirect("/"+customName)
        
      }
      else{
        res.render("list",{
          listTitle:foundList.name,
          newListItems:foundList.items
          

        })
      }
        
    }
  })



})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
