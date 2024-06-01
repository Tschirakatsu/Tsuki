/**
 * @file   hello.js
 * @brief  This command is used to say hello to someone and specify a reason
 * @author Created by Tschirakatsu
 * @version 26.9.2023
 */


const tenorGif = require("../Miscelanous/tenorGif");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: "hello",
        description: "say hello to someone",
        options: [
            {
                name: "user",
                description: "say hello to who ?",
                type: 6,
                required: true,
            },
            {
                name: "reason",
                description: "but why ?",
                type: 3,
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const{ options } = interaction;
        const userOption = options.getMember("user");
        const reasonOption = interaction.options.getString('reason');
        const user = interaction.user;
        const gifUrl = await tenorGif.getRandomGif('hi anime cute girl');

        // Create an embed with the GIF
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setDescription(`${user.displayName} is saying hello to ${userOption.displayName} Because ${reasonOption}`)
            .setImage(gifUrl);

        //Send the embed in a message
        interaction.reply({ embeds: [embed] });
    },
};