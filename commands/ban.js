/**
 * @file    ban.js
 * @brief   used to do the most important thing, ban peoples
 * @author  Created by tschi
 * @version 02/06/2024
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
            {
                name: "log-channel",
                description: "The channel to send ban logs. (optional)",
                type: 7,
                required: false,
            }
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
        const logChannelOption = options.getChannel("log-channel");
        let logChannel;

        if (logChannelOption && logChannelOption.name.includes('ban')) {
            logChannel = logChannelOption;
        } else {
            // If no valid log channel is provided or the name doesn't contain "ban", use the default channel
            logChannel = interaction.guild.systemChannel || interaction.channel;
        }
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
        logChannel.send({embeds: [banEmbed]});
        const thread = await logChannel.threads.create({
            name: `Ban Reason - ${reason} User Banned - ${user.tag}`,
            reason: 'Logging banned users',
        });
        thread.send("Tapez lui dessus il est BAN !!!!");
    },
};