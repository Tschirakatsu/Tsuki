const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { join } = require('path');
const DBConnector = require('../DBConnector');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removetrustlist')
        .setDescription('Remove the TrustList setup for this server'),

    async execute(interaction) {
        if (!interaction) {
            console.error('Interaction is null or undefined');
            return;
        }
        try {
            const guildId = interaction.guild.id;
            const db = new DBConnector();
            await db.connect();

            // Check if the server ID is already present in the Server table
            const existingServer = await db.query('SELECT * FROM Servers WHERE ServerID = ?', [guildId]);
            if (existingServer.length === 0) {
                await interaction.reply({
                    content: 'Error: Server ID does not exist in the database.',
                    ephemeral: true,
                });
                await db.close();
                return;
            }

            // Fetch the trusted and untrusted role IDs from the database
            const trustedRoleId = await db.query('SELECT RoleID FROM Roles WHERE ServerID = ? AND RoleName LIKE ?', [guildId, '%Trusted%']);
            const untrustedRoleId = await db.query('SELECT RoleID FROM Roles WHERE ServerID = ? AND RoleName LIKE ?', [guildId, '%Untrusted%']);
            const trustListChannelId = await db.query('SELECT TrustListChannelID FROM TrustList WHERE ServerID = ?', [guildId]);

            // Delete the trusted and untrusted roles
            const trustedRole = interaction.guild.roles.cache.find((role) => role.id === trustedRoleId.RoleID);
            if (trustedRole) {
                await trustedRole.delete();
            }

            const untrustedRole = interaction.guild.roles.cache.find((role) => role.id === untrustedRoleId.RoleID);
            if (untrustedRole) {
                await untrustedRole.delete();
            }

            // Delete the trustlist channel
            const trustListChannel = interaction.guild.channels.cache.find((channel) => channel.id === trustListChannelId.TrustListChannelID);
            if (trustListChannel) {
                await trustListChannel.delete();
            }

            // Remove the roles from the database
            const roles = await db.query('SELECT RoleID FROM Roles WHERE ServerID = ?', [guildId]);
            for (const role of roles) {
                const roleId = role.RoleID;
                await db.query('DELETE FROM Roles WHERE RoleID = ?', [roleId]);
            }

            // Remove the trustlist from the database
            await db.query('DELETE FROM TrustList WHERE ServerID = ?', [guildId]);

            // Remove the server from the database
            await db.query('DELETE FROM Servers WHERE ServerID = ?', [guildId]);

            await db.close();

            await interaction.reply({
                content: 'TrustList setup removed successfully.',
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'Error occurred. Please try again later.',
                ephemeral: true,
            });
        }
    }
};