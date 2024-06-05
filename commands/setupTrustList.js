/**
 * @file    setupTrustList.js
 * @brief   setuzp the trustlist logic
 * @author  Created by tschi
 * @version 03/06/2024
 */

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuptrustlist')
        .setDescription('Setup the TrustList for this server')
        .setDefaultPermissions(PermissionFlagsBits.ManageRoles), // Corrected method name
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const jsonFile = `./Trustlists/Servers/${guildId}.json`; // Generate a JSON file with ServerID as filename
        let trustedRole, untrustedRole, memberRole;

        // If roles are not specified by the user, create them
        if (!interaction.options.getRole('trusted')) {
            trustedRole = await interaction.guild.roles.create({
                name: 'Trusted',
                color: '#00ff00',
            });
        } else {
            trustedRole = interaction.options.getRole('trusted');
        }

        if (!interaction.options.getRole('untrusted')) {
            untrustedRole = await interaction.guild.roles.create({
                name: 'Untrusted',
                color: '#ff0000',
            });
        } else {
            untrustedRole = interaction.options.getRole('untrusted'); // corrected the typo here, it was previously 'untrustedRole' which should be 'untrusted'
        }

        if (!interaction.options.getRole('member')) {
            memberRole = await interaction.guild.roles.create({
                name: 'Member',
                color: '#0e70bb',
            });
        } else {
            memberRole = interaction.options.getRole('member');
        }

        // Store the roles id in a JSON file
        const data = {
            trustedRoleId: trustedRole.id,
            untrustedRoleId: untrustedRole.id,
            memberRoleId: memberRole.id,
        };
        fs.writeFileSync(jsonFile, JSON.stringify(data));

        // Fetch the Manage Roles role
        const manageRoles = interaction.guild.roles.cache.find((role) => role.permissions.has('MANAGE_ROLES'));

        // Create a channel named "TrustList" and send an embed with appropriate permissions
        const trustlistChannel = await interaction.guild.channels.create({
            name: 'TrustList',
            type: 'GUILD_TEXT',
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // Deny @everyone from sending messages in the channel
                    deny: ['SEND_MESSAGES'],
                },
                {
                    id: manageRoles.id, // Allow Manage Roles members to send messages and use commands
                    allow: ['SEND_MESSAGES', 'USE_APPLICATION_COMMANDS'],
                },
            ],
        });

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('TrustList Setup')
            .setDescription(`This channel has been setup as the trustlist for the server '${interaction.guild.name}'`);

        await trustlistChannel.send({ embeds: [embed] });
    },
};
