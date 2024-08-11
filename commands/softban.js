/**
 * @file    softban.js
 * @brief   gently ban peoples (no worries it's cute lol)
 * @author  Created by tschi
 * @version 11/08/2024
 */

const {PermissionsBitField, EmbedBuilder} = require("discord.js");
const moment = require('moment');
const fs = require('fs');

// exporting the command with all parameters
module.exports = {
    data: {
        name: "ban",
        description: "Ban a user from the server.",
        options: [
            {
                name: "user",
                description: "The user to ban.",
                type: 6, // User type
                required: true,
            },
            {
                name: "reason",
                description: "The reason for the ban.",
                type: 3, // String type
                required: true,
            },
        ],
        defaultMemberPermissions: PermissionsBitField.Flags.BanMembers,
    },
    async execute(interaction) {
        const {member, options} = interaction;
        const userOption = options.getMember("user");
        const tag = userOption.user.tag;
        const ID = userOption.user.id;
        const creationDate = moment(userOption.user.createdAt).format('MM/DD/YYYY HH:mm');
        const gifsData = JSON.parse(fs.readFileSync('./Miscelanous/ban.json', 'utf8'));
        const randomGifUrl = gifsData.banGIFs[Math.floor(Math.random() * gifsData.banGIFs.length)];

        const user = interaction.user;
        const reason = options.getString("reason");

        // Check if the member has the BanMembers permission
        if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            interaction.reply({
                content: "You do not have permissions to ban members.",
                ephemeral: true, //This makes the reply visible only to the executor and discardable.
            });
            return;
        }

        //Check if user is trying to ban themselves
        if (userOption.id === user.id) {
            interaction.reply({
                content: "You can't ban yourself, don't be a suicidal bitch",
                ephemeral: true,
            });
            return;
        }

        //Ban the user and send a message in an embed
        await userOption.ban({reason});

        const banEmbed = new EmbedBuilder()
            .setTitle('User Banned')
            .setDescription(`${userOption.user.tag} has been banned from this server!`)
            .setThumbnail(userOption.user.displayAvatarURL({dynamic: true}))
            .addFields(
                {name: 'Moderator', value: user.tag, inline: true},
                {name: 'Banned User', value: tag, inline: true},
                {name: 'ID', value: ID, inline: true},
                {name: 'Account Created At', value: creationDate, inline: true}
            )
            .setFooter({text: `Reason: ${reason}`})
            .setImage(randomGifUrl)
            .setColor('#FF0000'); // Red color for ban embed
        interaction.reply({embeds: [banEmbed]});
    },
};