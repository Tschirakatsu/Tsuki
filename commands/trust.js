/**
 * @file    trust.js
 * @brief   quick description of the purpose of the file
 * @author  Created by Luna :3
 * @version 21/10/2024
 */

const { CommandInteraction, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "trust",
        description: "Donne le rôle trusted à un utilisateur",
        options: [
            {
                name: "user",
                description: "L'utilisateur à qui donner le rôle",
                type: 6, // USER type
                required: true,
            },
            {
                name: "language",
                description: "choose the language in which the embeds will be displayed",
                type: 3, // STRING type
                required: true,
                choices: [
                    {
                        name: "Français", value: "fr",
                    },
                    {
                        name: "English", value: "en",
                    }
                ]
            },
            {
                name: "reason",
                description: "The reason to give the role.",
                type: 3, // STRING type
                required: false,
            }
        ],
    },
    async execute(interaction) {
        if (!interaction.isCommand()) {
            return;
        }

        const { member, options } = interaction;
        const userOption = options.getMember("user");
        const user = interaction.user;
        const reason = options.getString("reason");
        const language = options.getString("language"); // Retrieve the language option


        if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            await interaction.reply({
                content: "You do not have the permisson to execute this command.",
                ephemeral: true,
            });
            return;
        }

        try {
            const normalizeString = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const roles = interaction.guild.roles.cache;
            console.log("Fetched roles:", roles.map(role => role.name)); // Debug log

            const trustedRole = roles.find(role => normalizeString(role.name).includes('trusted'));
            const untrustedRole = roles.find(role => normalizeString(role.name).includes('untrusted'));
            const memberRole = roles.find(role => normalizeString(role.name).includes('member'));

            if (!trustedRole || !untrustedRole || !memberRole) {
                throw new Error('One or more roles were not found');
            }

            const trustedRoleId = trustedRole.id;
            const untrustedRoleId = untrustedRole.id;
            const memberRoleId = memberRole.id;

            await userOption.roles.add(trustedRoleId);
            await userOption.roles.add(memberRoleId);
            await userOption.roles.remove(untrustedRoleId);

            const tag = user.tag;
            const ID = userOption.user.id;
            const creationDate = userOption.user.createdAt.toDateString();

            let trustedEmbed;
            let welcomeEmbed;

            if (language === 'en') {
                trustedEmbed = new EmbedBuilder()
                    .setTitle('User Trusted')
                    .setDescription(`${userOption.user.tag} has been trusted on the server.`)
                    .setThumbnail(userOption.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'Moderator', value: user.tag, inline: true },
                        { name: 'Trusted User', value: tag, inline: true },
                        { name: 'ID', value: ID, inline: true },
                        { name: 'Account Created At', value: creationDate, inline: true }
                    )
                    .setImage("https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWcwcWJ4eGF1MjZpMjF1ZmxmZGtoZ282NTZ4dHZzaGpxZHFqY3R2NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1202FEj8qyNg3K/giphy.gif")
                    .setColor('#613ee8');
                if (reason) {
                    trustedEmbed.setFooter({ text: `Reason: ${reason}` });
                }

                welcomeEmbed = new EmbedBuilder()
                    .setTitle('Welcome!')
                    .setDescription(`Welcome to the server, ${user.tag}! You've been trusted by ${user.tag}.`)
                    .setThumbnail(userOption.user.displayAvatarURL({ dynamic: true }))
                    .setColor('#00ff00');
            } else if (language === 'fr') {
                trustedEmbed = new EmbedBuilder()
                    .setTitle('Utilisateur de confiance')
                    .setDescription(`${userOption.user.tag} a été approuvé sur le serveur.`)
                    .setThumbnail(userOption.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'Modérateur', value: user.tag, inline: true },
                        { name: 'Utilisateur', value: tag, inline: true },
                        { name: 'ID', value: ID, inline: true },
                        { name: 'Compte créé le', value: creationDate, inline: true }
                    )
                    .setImage("https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWcwcWJ4eGF1MjZpMjF1ZmxmZGtoZ282NTZ4dHZzaGpxZHFqY3R2NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1202FEj8qyNg3K/giphy.gif")
                    .setColor('#613ee8');
                if (reason) {
                    trustedEmbed.setFooter({ text: `Reason: ${reason}` });
                }

                welcomeEmbed = new EmbedBuilder()
                    .setTitle('Bienvenue !')
                    .setDescription(`Bienvenue sur le serveur, ${userOption.user.tag} ! Vous avez été approuvé par ${user.tag}.`)
                    .setThumbnail(userOption.user.displayAvatarURL({ dynamic: true }))
                    .setColor('#00ff00');
            }

            await interaction.reply({
                embeds: [trustedEmbed]
            });

            const generalChannel = interaction.guild.channels.cache.find(channel => {
                console.log("Checking channel:", channel.name); // Debug log
                return normalizeString(channel.name).includes('general');
            });
            console.log("General channel:", generalChannel); // Debug log

            if (generalChannel) {
                await generalChannel.send({ embeds: [welcomeEmbed] }).catch(err => {
                    console.error('Error sending welcome message:', err);
                });
            } else {
                console.error('General channel not found');
            }

        } catch (error) {
            console.error('Error giving roles:', error);
            await interaction.reply({
                content: "There was an error while trying to attribute the roles or while fetching channels. please try again or contact an administrator.",
                ephemeral: true,
            });
        }
    },
};
