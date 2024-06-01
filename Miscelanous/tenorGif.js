const axios = require("axios");
require('dotenv').config();
const {apiKey} = require("../Credentials");
// Replace this value with your actual Giphy API key
const SEARCH_LIMIT = 10; // Number of GIFs to fetch from Giphy

async function getRandomGif(keyword) {
    try {
        const response = await axios.get(`https://api.giphy.com/v1/gifs/search/?q=${keyword}&api_key=${apiKey}&limit=${SEARCH_LIMIT}&sort=relevance`);
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = response.data;
        if (data.data && data.data.length > 0) {
            // Select a random GIF from the results
            const randomIndex = Math.floor(Math.random() * data.data.length);
            return data.data[randomIndex].images.fixed_height.url;
        } else {
            throw new Error('No GIFs found for the keyword');
        }
    } catch (error) {
        console.error(error);
        console.error('Failed to retrieve a GIF for keyword:', error.message, keyword);
        return null;
    }
}

module.exports = { getRandomGif };
