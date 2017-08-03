var fs = require("fs");
var Inquirer = require("inquirer");
var Spotify = require("node-spotify-api");
var Twitter = require("twitter");
var request = require("request");
var keys = require("./keys.js");
var clientTwitter = new Twitter(keys.twitterKeys);
var clientSpotify = new Spotify(keys.spotifyKeys);
var command = "";
var txtParam = "";
var txtCommand = false;

Inquirer.prompt([
    {
        type:"list",
        message: "What would you like Liri to do? ",
        choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
        name: "command"
    }
]).then(function(resp){
    command = resp.command;
    if(command === "do-what-it-says"){
        var textArr = fs.readFileSync("random.txt", "utf8").split(",");
        command = textArr[0];
        textParam = textArr[1];
        txtCommand = true;
    }  
    if (command === "spotify-this-song"){
        if (!txtCommand){
            Inquirer.prompt([
                {
                    type: "input",
                    message: "Which song would you like to look up? ",
                    name: "songTitle"
                }
            ]).then(function(resp){
                clientSpotify.search({ type: 'track', query: resp.songTitle }, function(err, data) {
                    if (err) {
                        return console.log('Error occurred: ' + err);
                    }
                    console.log(data.tracks.items[0].artists[0].name);
                    console.log(data.tracks.items[0].name);
                    console.log(data.tracks.items[0].preview_url);
                    console.log(data.tracks.items[0].album.name); 
                });
            });
        } else{
            clientSpotify.search({ type: 'track', query: textParam }, function(err, data) {
                if (err) {
                    return console.log('Error occurred: ' + err);
                }
                console.log(data.tracks.items[0].artists[0].name);
                console.log(data.tracks.items[0].name);
                console.log(data.tracks.items[0].preview_url);
                console.log(data.tracks.items[0].album.name); 
            });
        }
    } else if (command === "movie-this"){
        Inquirer.prompt([
            {
                type: "input",
                message: "Which movie would you like to search for? ",
                name: "movieTitle"
            }
        ]).then(function(resp){
            var queryURL = `http://www.omdbapi.com/?apikey=40e9cece&t=${resp.movieTitle}`;
            request(queryURL, function (error, response, body) {
                var film = JSON.parse(body);
                if (!error){
                    console.log(`Title: ${film.Title}`);
                    console.log(`Released: ${film.Year}`);
                    if(film.Ratings){
                        film.Ratings.forEach(function(element){
                            console.log(`${element.Source}: ${element.Value}`);
                        });
                    }
                    console.log(`Country: ${film.Country}`);
                    console.log(`Language: ${film.Language}`);
                    console.log(`Plot: ${film.Plot}`);
                    console.log(`Actors: ${film.Actors}`);
                } else{
                    console.log(error);
                }
            });
        });

    } else if (command === "my-tweets"){
        var params = 
            {
                screen_name: 'valyrian_bot',
                count: "20"
            };
        clientTwitter.get('statuses/user_timeline', params, function(error, tweets, response) {
            if (!error) {
                tweets.forEach(function(element) {
                    console.log(`Tweet number ${tweets.indexOf(element) + 1}: ${element.text}`);
                    console.log(`Created at: ${element.created_at}`);
                });
            } else{
                console.log(error);
            }
        });
    }
});


