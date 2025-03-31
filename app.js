require("dotenv").config();
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const cron = require("cron");


const app = express();

app.use(express.static("public"));
app.set("view engine" , "ejs");
app.use(bodyParser.urlencoded({extended:true}));


app.get("/" , function(req, res){

  res.render("home", {temp: ""});

});


app.post("/" , function(req, res){


  const currentdate = new Date();
  const now =  currentdate.getHours() + ":"  
  + currentdate.getMinutes() + " - " 
  + (currentdate.getDate())  + "/" 
  + (currentdate.getMonth()+1)  + "/" 
  + currentdate.getFullYear()

  const query = req.body.cityName;

  const pageTitle = query.charAt(0).toUpperCase() + query.slice(1)

  const apiKey= process.env.API_KEY;
  const units = "metric";

  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&units=" + units + "&appid=" + apiKey;

  https.get(url , function(response){
    
        response.on("data" , function(data){
          const weatherData = JSON.parse(data);
          if(weatherData.cod !== '404'){
            const temp = weatherData.main.temp;
            const temperature = temp.toFixed(1);
            const description = weatherData.weather[0].description;
            const icon = weatherData.weather[0].icon;
            const imageUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png"
            const country = weatherData.sys.country;
            const feels_like = weatherData.main.feels_like;
            const pressure = weatherData.main.pressure;
            const humidity = weatherData.main.humidity;
            const wind_speed = weatherData.wind.speed;
  
            let weatherPicture = "";
  
            if (icon === "01d" || icon === "01n"){
              weatherPicture = "clear sky";
            }
            else if (icon === "02d" || icon === "02n"){
              weatherPicture = "few clouds";
            }
            else if (icon === "03d" || icon === "03n"){
              weatherPicture = "scattered clouds";
            }
            else if (icon === "04d" || icon === "04n"){
              weatherPicture = "broken clouds";
            }
            else if (icon === "09d" || icon === "09n"){
              weatherPicture = "shower rain";
            }
            else if (icon === "10d" || icon === "10n"){
              weatherPicture = "rain";
            }
            else if (icon === "11d" || icon === "11n"){
              weatherPicture = "thunderstorm";
            }
            else if (icon === "13d" || icon === "13n"){
              weatherPicture = "snow";
            }
            else if (icon === "50d" || icon === "50n"){
              weatherPicture = "mist";
            }
  
            const weatherPictureUrl = "../images/"+ weatherPicture +".jpg";
            
            res.render("respondingPage", {title: pageTitle, temperature: temperature, description: description, 
                                        imageUrl: imageUrl, city: pageTitle, country: country, feels_like: feels_like,
                                        pressure: pressure, humidity: humidity, wind_speed: wind_speed, 
                                        weatherPictureUrl:weatherPictureUrl, date: now});
        }
        else{
            res.render("home", {temp: undefined});
        }
      })
    })
      
});

const backendUrl = "https://weatherlive-9kk4.onrender.com";
const job = new cron.CronJob('*/14 * * * *', function(){
  https.get(backendUrl, (res) => {
    if (res.statusCode === 200){
      console.log("server restarted")
    }
  }).on("error", (err) => {
      console.log("error");
  })
})
job.start();

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running successfully !");
})
