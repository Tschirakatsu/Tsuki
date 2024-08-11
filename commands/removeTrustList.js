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
            const trustedRoleIdResult = await db.query('SELECT RoleID FROM Roles WHERE ServerID = ? AND RoleName LIKE ?', [guildId, '%Trusted%']);
            const untrustedRoleIdResult = await db.query('SELECT RoleID FROM Roles WHERE ServerID = ? AND RoleName LIKE ?', [guildId, '%Untrusted%']);
            const trustListChannelIdResult = await db.query('SELECT TrustListChannelID FROM TrustList WHERE ServerID = ?', [guildId]);

            // Log the fetched IDs for debugging
            console.log('Trusted Role ID:', trustedRoleIdResult[0]?.RoleID);
            console.log('Untrusted Role ID:', untrustedRoleIdResult[0]?.RoleID);
            console.log('TrustList Channel ID:', trustListChannelIdResult[0]?.TrustListChannelID);

            // Fetch the roles and channel from the guild cache
            const trustedRole = interaction.guild.roles.cache.get(trustedRoleIdResult[0]?.RoleID);
            const untrustedRole = interaction.guild.roles.cache.get(untrustedRoleIdResult[0]?.RoleID);
            const trustListChannel = interaction.guild.channels.cache.get(trustListChannelIdResult[0]?.TrustListChannelID);

            // Delete the roles if they exist
            if (trustedRole) {
                await trustedRole.delete().catch(error => console.error('Error deleting Trusted role:', error));
            } else {
                console.warn('Trusted role not found');
            }

            if (untrustedRole) {
                await untrustedRole.delete().catch(error => console.error('Error deleting Untrusted role:', error));
            } else {
                console.warn('Untrusted role not found');
            }

            // Delete the trust list channel if it exists
            if (trustListChannel) {
                await trustListChannel.delete().catch(error => console.error('Error deleting TrustList channel:', error));
            } else {
                console.warn('TrustList channel not found');
            }

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
