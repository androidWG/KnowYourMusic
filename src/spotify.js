import {popup} from "@/popup";
import {generateRandomString, getRandomInt} from "@/util";
const axios = require("axios");

const spotify_client_secret = process.env.VUE_APP_SPOTIFY_CLIENT_SECRET;
const spotify_client_id = process.env.VUE_APP_SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.VUE_APP_REDIRECT_URI;

let player = null;

export async function getLoginCode() {
    let scope =
        "user-read-email user-read-private playlist-read-private user-library-read playlist-read-collaborative streaming";

    let queryParams = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        redirect_uri: redirect_uri,
        scope: scope,
        state: generateRandomString(8),
    });

    return await popup("https://accounts.spotify.com/authorize/?" + queryParams.toString());
}

export async function getAccessToken(code) {
    let xhr = new XMLHttpRequest();
    let requestBody = new URLSearchParams({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
    });

    xhr.open("POST", "https://accounts.spotify.com/api/token", true);
    xhr.setRequestHeader(
        "Authorization",
        "Basic " +
        btoa(`${spotify_client_id}:${spotify_client_secret}`)
    );
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(requestBody.toString());

    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                let response = JSON.parse(this.responseText);
                resolve(response.access_token);
            } else if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
                reject("Login failed")
            }
        };
    })
}

export async function getRandomSong(token) {
    let headers = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    return new Promise((resolve, reject) => {
        axios({
            method: "get",
            responseType: "json",
            url: "https://api.spotify.com/v1/me/tracks",
            params: {
                limit: 50
            },
            headers: headers
        }).then((response) => {
            let pages = Math.ceil(response.data.total / response.data.limit);
            let offset = getRandomInt(0, pages);

            axios({
                method: "get",
                responseType: "json",
                url: "https://api.spotify.com/v1/me/tracks",
                params: {
                    limit: 50,
                    offset: offset
                },
                headers: headers
            }).then((response) => {
                let trackNum = getRandomInt(0, response.data.items.length);
                resolve(response.data.items[trackNum].track);
            }).catch((error) => {
                console.log(error);
                reject("Error while getting random song");
            });
        }).catch((error) => {
            console.log(error);
            reject("Error while getting random song");
        });
    })
}

export async function initializePlayer(token) {
    player = new window.Spotify.Player({
        name: "Know Your Music Player",
        getOAuthToken: (cb) => {
            cb(token);
        },
    })

    player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
    });

    player.addListener("initialization_error", ({ message }) => {
        console.error(message);
    });

    player.addListener("authentication_error", ({ message }) => {
        console.error(message);
    });

    player.addListener("account_error", ({ message }) => {
        console.error(message);
    });

    player.connect();

    return new Promise((resolve) => {
        player.addListener("ready", ({ device_id }) => {
            console.log("Ready with Device ID", device_id);
            resolve(device_id);
        });
    })
}

export function playSong(uri, token, deviceId) {
    let headers = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    }

    axios.put("https://api.spotify.com/v1/me/player/play",
    { uris: [uri]},
    {method: "put",
        responseType: "json",
        params: {device_id: deviceId},
        headers: headers
    }).catch((error) => {
        console.log(error);
    });
}
