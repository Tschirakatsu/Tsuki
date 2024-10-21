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
                name: "reason",
                description: "La raison de donner le rôle",
                type: 3, // STRING type
                required: true,
            },
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

        if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            await interaction.reply({
                content: "Vous n'avez pas la permission d'exécuter cette commande.",
                ephemeral: true,
            });
            return;
        }

        try {
            const roles = interaction.guild.roles.cache;
            console.log("Fetched roles:", roles.map(role => role.name)); // Debug log

            const trustedRole = roles.find(role => role.name.toLowerCase().includes('trusted'));
            const untrustedRole = roles.find(role => role.name.toLowerCase().includes('untrusted'));
            const memberRole = roles.find(role => role.name.toLowerCase().includes('member'));

            if (!trustedRole || !untrustedRole || !memberRole) {
                throw new Error('One or more roles were not found');
            }

            const trustedRoleId = trustedRole.id;
            const untrustedRoleId = untrustedRole.id;
            const memberRoleId = memberRole.id;

            await userOption.roles.add(trustedRoleId);
            await userOption.roles.add(memberRoleId);
            await userOption.roles.remove(untrustedRoleId);

            const tag = userOption.user.tag;
            const ID = userOption.user.id;
            const creationDate = userOption.user.createdAt.toDateString();

            const trustedEmbed = new EmbedBuilder()
                .setTitle('User Trusted')
                .setDescription(`${userOption.user.tag} has been trusted on the server.`)
                .setThumbnail(userOption.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Moderator', value: user.tag, inline: true },
                    { name: 'Trusted User', value: tag, inline: true },
                    { name: 'ID', value: ID, inline: true },
                    { name: 'Account Created At', value: creationDate, inline: true }
                )
                .setFooter({ text: `Reason: ${reason}` })
                .setImage("https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWcwcWJ4eGF1MjZpMjF1ZmxmZGtoZ282NTZ4dHZzaGpxZHFqY3R2NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1202FEj8qyNg3K/giphy.gif")
                .setColor('#613ee8');

            await interaction.reply({
                embeds: [trustedEmbed]
            });

            const generalChannel = interaction.guild.channels.cache.find(channel => {
                console.log("Checking channel:", channel.name); // Debug log
                return channel.name.toLowerCase().includes('general' || 'genéral');
            });
            console.log("General channel:", generalChannel); // Debug log

            if (generalChannel) {
                const welcomeEmbed = new EmbedBuilder()
                    .setTitle('Welcome!')
                    .setDescription(`Welcome to the server, ${userOption.user.tag}! You've been trusted by ${user.tag}.`)
                    .setThumbnail(userOption.user.displayAvatarURL({ dynamic: true }))
                    .setColor('#00ff00');

                await generalChannel.send({ embeds: [welcomeEmbed] }).catch(err => {
                    console.error('Error sending welcome message:', err);
                });
            } else {
                console.error('General channel not found');
            }

        } catch (error) {
            console.error('Error giving roles:', error);
            await interaction.reply({
                content: "Une erreur s'est produite lors de l'attribution des rôles.",
                ephemeral: true,
            });
        }
    },
};