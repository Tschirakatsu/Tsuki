/**
 * @file    kick.js
 * @brief   quick description of the purpose of the file
 * @author  Created by tschi
 * @version 12/08/2024
 */

const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const moment = require('moment');
const fs = require('fs');

module.exports = {
    data: {
        name: "kick",
        description: "Kicks a user from the server",
        options: [
            {
                name: "user",
                description: "The user to kick.",
                type: 6, // User type
                required: true,
            },
            {
                name: "reason",
                description: "The reason for the kicking.",
                type: 3, // String type
                required: true,
            },
        ],
        defaultMemberPermissions: PermissionsBitField.Flags.KickMembers,
    },
    async execute(interaction) {
        const { member, options } = interaction;
        const userOption = options.getMember("user");
        const tag = userOption.user.tag;
        const ID = userOption.user.id;
        const creationDate = moment(userOption.user.createdAt).format('MM/DD/YYYY HH:mm');
        const gifsData = JSON.parse(fs.readFileSync('./Miscelanous/kick.json', 'utf8'));
        const randomGifUrl = gifsData.kickGIFs[Math.floor(Math.random() * gifsData.kickGIFs.length)];

        const user = interaction.user;
        const reason = options.getString("reason");

        // Check if the member has the BanMembers permission
        if (!member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            interaction.reply({
                content: "You do not have permissions to kick members.",
                ephemeral: true,
            });
            return;
        }

        // Check if user is trying to ban themselves
        if (userOption.id === user.id) {
            interaction.reply({
                content: "You can't kick yourself, don't be a suicidal bitch",
                ephemeral: true,
            });
            return;
        }

        // Ban the user and send a message in an embed
        await userOption.kick({ reason });

        const kickEmbed = new EmbedBuilder()
            .setTitle('User Kicked')
            .setDescription(`${userOption.user.tag} has been kicked from this server !`)
            .setThumbnail(userOption.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Moderator', value: user.tag, inline: true },
                { name: 'Kicked User', value: tag, inline: true },
                { name: 'ID', value: ID, inline: true },
                { name: 'Account Created At', value: creationDate, inline: true }
            )
            .setFooter({ text: `Reason: ${reason}` })
            .setImage(randomGifUrl)
            .setColor('#20105c');

        // Send the embed to the log channel
        interaction.reply({ embeds: [kickEmbed] });

    },
};