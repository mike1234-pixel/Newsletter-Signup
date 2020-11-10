const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const dotenv = require('dotenv');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public")); // enables us to refer to static files to get bootstrap, css and local image sources working.

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res) {
  const email = req.body.email;
  const firstName = req.body.fname;
  const lastName = req.body.lname;

  //Mailchimp wants data sent back in a specific format as flatpack JSON

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  //turns the data object into a string which is in the format of a JSON.
  const jsonData = JSON.stringify(data);

  const url = process.env.MAILCHIMP_URI;

  const options = {
    method: "POST",
    auth: process.env.MAILCHIMP_AUTH,
  };

  const request = https.request(url, options, function(response) {
    response.on("data", function(data) {
      console.log(JSON.parse(data));
    });

    // if signup was successful / status code == 200, send success page, else send failure page

    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
  });

  /* console log the response code. if response code 200 send success page, else send failure page */

  request.write(jsonData);
  request.end();

  console.log(email, firstName, lastName);
});

// listening for a dynamic port that heroku will choose to deploy from
// or listen on port 3013 when we're running locally

app.listen(process.env.PORT || 3013, function() {
  console.log("Server is running on port 3013");
});

/*api key aa00be48ff1bb341e437160e0afe5eef-us19*/

/*list id 502600c8c0*/

// Procfile tells heroku what cmd to use to run our app and which file contains our server code
