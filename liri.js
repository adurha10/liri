var fs = require("fs");
var Inquirer = require("inquirer");
var Spotify = require("node-spotify-api");
var Twitter = require("twitter");
var request = require("request");
var keys = require("./keys.js");
const log = require('simple-node-logger').createSimpleFileLogger('liri.log');
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
    log.info(`User selected ${command}`)
    if(command === "do-what-it-says"){
        var textArr = fs.readFileSync("random.txt", "utf8").split(",");
        command = textArr[0];
        textParam = textArr[1];
        log.info(`'do-what-it-says' issued "${command}" command with "${textParam}" as parameters`);
        txtCommand = true;
    }  
    if (command === "spotify-this-song"){
        log.info(`spotify-this-song selected`);
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
                        log.error(`Error encountered while searching Spotify for ${resp.songTitle} - Error: ${err}`);
                        return console.log('Error occurred: ' + err);
                    }
                    log.info(`Spotify successfully searched for ${resp.songTitle}`);
                    console.log(data.tracks.items[0].artists[0].name);
                    console.log(data.tracks.items[0].name);
                    console.log(data.tracks.items[0].preview_url);
                    console.log(data.tracks.items[0].album.name); 
                });
            });
        } else{
            clientSpotify.search({ type: 'track', query: textParam }, function(err, data) {
                log.info(`Spotify search called from random.txt`)
                if (err) {
                    log.error(`Error encountered while searching Spotify for ${textParam} - Error: ${err}`);
                    return console.log('Error occurred: ' + err);
                }
                console.log(data.tracks.items[0].artists[0].name);
                console.log(data.tracks.items[0].name);
                console.log(data.tracks.items[0].preview_url);
                console.log(data.tracks.items[0].album.name); 
            });
        }
    } else if (command === "movie-this"){
        log.info(`movie-this selected`);
        Inquirer.prompt([
            {
                type: "input",
                message: "Which movie would you like to search for? ",
                name: "movieTitle"
            }
        ]).then(function(resp){
            var queryURL = `http://www.omdbapi.com/?apikey=40e9cece&t=${resp.movieTitle}`;
            request(queryURL, function (err, response, body) {
                var film = JSON.parse(body);
                if (!error){
                    log.info(`OMDB successfully searched for ${resp.movieTitle}`)
                    log.info(`queryURL: ${queryURL}`);
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
                    log.error(`Error from OMDB while searching for ${resp.movieTitle} - Error: ${err}`)
                    console.log(err);
                }
            });
        });

    } else if (command === "my-tweets"){
        log.info(`my-tweets selected`);
        var params = 
            {
                screen_name: 'valyrian_bot',
                count: "20"
            };
        clientTwitter.get('statuses/user_timeline', params, function(err, tweets, response) {
            if (!err) {
                log.info(`Successful call to Twitter API for tweets from ${params.screen_name}`)
                tweets.forEach(function(element) {
                    console.log(`Tweet number ${tweets.indexOf(element) + 1}: ${element.text}`);
                    console.log(`Created at: ${element.created_at}`);
                });
            } else{
                log.error(`Error while attempting to display tweets from ${params.screen_name} - Error: ${err}`)
                console.log(err);
            }
        });
    }
});


