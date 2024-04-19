const express = require("express");
const app = express();

const connectToDatabase = require('./db');
app.use(connectToDatabase);


const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body

const port = 8080;



app.listen(port, () => {
    console.log(`listening the port ${port}`);
})