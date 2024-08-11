const { SlashCommandBuilder } = require('discord.js');
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

        const guildId = interaction.guild.id;
        const db = new DBConnector();

        try {
            await db.connect();

            // Check if the server exists in the database
            const existingServer = await db.query('SELECT * FROM Servers WHERE ServerID = ?', [guildId]);
            if (existingServer.length === 0) {
                await interaction.reply({ content: 'Error: Server ID does not exist in the database.', ephemeral: true });
                return;
            }

            // Fetch the role and channel IDs
            const trustedRoleId = await db.query('SELECT RoleID FROM Roles WHERE ServerID = ? AND RoleName LIKE ?', [guildId, '%Trusted%']);
            const untrustedRoleId = await db.query('SELECT RoleID FROM Roles WHERE ServerID = ? AND RoleName LIKE ?', [guildId, '%Untrusted%']);
            const trustListChannelId = await db.query('SELECT TrustListChannelID FROM TrustList WHERE ServerID = ?', [guildId]);

            // Delete the roles
            const trustedRole = interaction.guild.roles.cache.get(trustedRoleId[0]?.RoleID);
            if (trustedRole) await trustedRole.delete().catch(console.error);

            const untrustedRole = interaction.guild.roles.cache.get(untrustedRoleId[0]?.RoleID);
            if (untrustedRole) await untrustedRole.delete().catch(console.error);

            // Delete the trust list channel
            const trustListChannel = interaction.guild.channels.cache.get(trustListChannelId[0]?.TrustListChannelID);
            if (trustListChannel) await trustListChannel.delete().catch(console.error);

            // Remove the trust list and server from the database
            await db.query('DELETE FROM TrustList WHERE ServerID = ?', [guildId]);
            await db.query('DELETE FROM Roles WHERE ServerID = ?', [guildId]);
            await db.query('DELETE FROM Servers WHERE ServerID = ?', [guildId]);

            await interaction.reply({ content: 'TrustList setup removed successfully.', ephemeral: true });

        } catch (error) {
            console.error('Error removing TrustList:', error);
            await interaction.reply({ content: 'An error occurred. Please try again later.', ephemeral: true });
        } finally {
            await db.close();
        }
    }
};