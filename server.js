const express = require("express");
const app = express();

const mongoose = require("mongoose");
const connectToDatabase = require('./db.js');

//for define path
const path = require("path");

//make ejs supported views folder connect to express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

//override
const { count } = require("console");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended : true}));


// const bodyParser = require('body-parser'); 
// app.use(bodyParser.json()); // req.body

const port = 8080;

const noteRoutes = require("./routes/noteRoutes.js");
app.use('/note', noteRoutes);


const userRoutes = require("./routes/userRoutes.js");
app.use('/user', userRoutes);


app.get("/", (req, res) => {
    res.send("home reached");
})

app.use(connectToDatabase);

app.listen(port, () => {
    console.log(`listening the port ${port}`);
})

