var weather = require("weather-js");

weather.find({ search: "charlotte, NC", degreeType: "F"}, function(err, result){
    console.log(result);
    console.log(`Current Temperature: ${result[0].current.temperature}`);
    console.log("Current Temperature: " + result[0].current.temperature);
});