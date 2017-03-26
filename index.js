"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const Yelp = require('yelp-api-v3');

var yelp = new Yelp({
  app_id: "g4GGJOk6feS7HoSDAfzJtw",
  app_secret: "tIJAG3oWzXTA9YJUJunB4DrDqwFtYbrGR6BrICG2U0lWk05ucvT8gvlesvrhZElt"
});

const restService = express();
restService.use(bodyParser.json());

var cityName = "Fremont";
var yType = "";
var cardsSend = [];

restService.get("/p", function (req, res) {
  console.log("hook request");
  try {
    if (req) {
      if(req.query.yerq) {
        getFoodPlaces(req, function(result) {
                     //callback is ultimately to return Messenger appropriate responses formatted correctly
                     console.log("results w/ getFoodPlaces: ", cardsSend);
                     if(cardsSend){
                       return res.json({
                         results: cardsSend,
                       });
                     }
                     else{
                       return res.json({
                         err: "NOCARDSFOUND"
                       });
                     }
                   });
      }
    }
  }
  catch (err) {
    console.error("Cannot process request", err);
    return res.status(400).json({
      status: {
        code: 400,
        errorType: err.message
      }
    });
  }
});

function getFoodPlaces(req,callback) {
  yType = "";
  cardsSend = [];
  console.log("req: " + req);
  console.log("req.query.location: "+req.query.location);
  cityName = req.query.location;
  console.log("cityName: "+cityName);
  console.log("req.query.location: "+req.query.yerq);
  yType = (req.query.yerq != "undefined" && req.query.yerq != "null" && req.query.yerq != "") ? req.query.yerq : "American";
  console.log("set yType: "+yType);
  YelpCall(callback);
}

function YelpCall(callback){
  console.log("yelp call entered");
  console.log("yelpCall yType: "+yType);

  yelp.search({term: yType, location: cityName, limit: 10, categories: "food"})
  .then(function (data) {
    console.log("got yelp response");
    console.log("data pre-JSONparse: "+data);
    var data = JSON.parse(data);
    console.log("data: "+data);
    if(data.total > 0){
      var lim = data.total >= 10 ? 10 : data.total;
      for(var i = 0; i < lim; i++){
        if(data.businesses[i]){
          var cardObj = {
            title: "",
            image_url: "",
            subtitle: "",
            buttons: [{
              type: "web_url",
              url: "",
              title: "View Place"
            }]
          };
          cardObj.title = data.businesses[i].name;
          cardObj.image_url = data.businesses[i].image_url;
          cardObj.subtitle = data.businesses[i].location.address1;
          cardObj.buttons[0].url = data.businesses[i].url;
          cardsSend[i] = cardObj;
        }
      }
    }
    callback();
  })
  .catch(function (err) {
    console.error("yelp err: " + err);
  });
}

restService.listen((process.env.PORT || 8000), function () {
  console.log("Server listening");
});
