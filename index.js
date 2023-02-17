
import express from "express";
import Hashids from "hashids";
import fs from "fs";


// Init express
const app = express();


const dataPath = './salt.json'
const setSalt = (data) => {
     const stringifyData = JSON.stringify(data)
     fs.writeFileSync(dataPath, stringifyData)
}

const getSalt = () => {
     const jsonData = fs.readFileSync(dataPath)
     return JSON.parse(jsonData)
}

//init hashids with salt
const hashids = new Hashids(getSalt().salt, 32)
//Middleware
app.use(express.json());

// Testing database connection

// product router
app.get("/encode/:value", (req, res) => {
     if (req.params.value === undefined || req.params.value === null || req.params.value === "") {
          res.json({ message: "required value" })
     }
     const response = hashids.encode(req.params.value)
     res.json({
          message: "success",
          encode: response
     })
});

app.get("/decode/:value", (req, res) => {
     if (req.params.value === undefined || req.params.value === null || req.params.value === "") {
          res.json({ message: "required value" })
     }
     const response = hashids.decode(req.params.value)
     res.json({
          message: "success",
          decode: response[0]
     })
});


//set salt
app.post("/salt/set", (req, res) => {
     if (req.body.salt === undefined || req.body.salt === null || req.body.salt === "") {
          res.json({ message: "required salt" })
     }
     const get = getSalt()
     get['salt'] = req.body.salt

     console.log()
     setSalt(get)
     res.json({
          message: "success",
          ...getSalt()
     })
});


//get salt
app.get("/salt", (req, res) => {
     res.json({
          message: "success",
          ...getSalt()
     })
});


// listen on port
const port = 3080
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));