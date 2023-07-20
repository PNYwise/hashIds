
import express from "express";
import Hashids from "hashids";
import fs from "fs";
import 'dotenv/config'


// Init express
const app = express();
const token = process.env.TOKEN
const apiUrl = process.env.API

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

//set city
app.get("/set-city", async (req, res) => {
     const datum = [];

     for (let index = 11; index < 95; index++) {
          const apiUrl = `https://dev.farizdotid.com/api/daerahindonesia/kota?id_provinsi=${index}`;
          try {
               // Fetch the data from the API using node-fetch
               const response = await fetch(apiUrl);

               // Check if the response is successful
               if (!response.ok) {
                    throw new Error('Network response was not ok');
               }

               // Parse the response data as JSON
               const responseJson = await response.json();
               const cities = responseJson.kota_kabupaten

               for (const city of cities) {
                    datum.push(city);
               }
          } catch (error) {
               // Handle any errors that occurred during the fetch
               console.error('Error fetching data:', error);
          }

     }

     const newDatum = datum.map((v) => {
          const str = v?.id;
          const first = str.toString().slice(0, 2);
          const last = str.toString().slice(-2);
          const code = `${first}.${last}`
          return {
               code,
               name: v.nama
          }
     })
     //save to database

     for (const data of newDatum) {
          fetchCity(data)
     }

     res.json({
          message: "success",
          data: newDatum
     });
});




const fetchCity = (body) => {
     var myHeaders = new Headers();
     myHeaders.append("Content-Type", "application/json");
     myHeaders.append("Authorization", `Bearer ${token}`);

     var raw = JSON.stringify(body);

     var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
     };

     fetch(`${apiUrl}/api/v0/master/cities/create`, requestOptions)
          .then(response => response.text())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
}


// listen on port
const port = 3000
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));