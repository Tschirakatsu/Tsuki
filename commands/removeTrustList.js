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

            // Fetch all relevant data in a single query
            const trustListData = await db.query(`
                SELECT TL.TrustListChannelID, R1.RoleID AS TrustedRoleID, R2.RoleID AS UntrustedRoleID
                FROM TrustList TL
                JOIN Roles R1 ON TL.ServerID = R1.ServerID AND R1.RoleName LIKE '%Trusted%'
                JOIN Roles R2 ON TL.ServerID = R2.ServerID AND R2.RoleName LIKE '%Untrusted%'
                WHERE TL.ServerID = ?
            `, [guildId]);

            if (trustListData.length === 0) {
                await interaction.reply({ content: 'Error: TrustList setup not found for this server.', ephemeral: true });
                return;
            }

            const { TrustedRoleID, UntrustedRoleID, TrustListChannelID } = trustListData[0];

            // Log the fetched IDs for debugging
            console.log('Trusted Role ID:', TrustedRoleID);
            console.log('Untrusted Role ID:', UntrustedRoleID);
            console.log('TrustList Channel ID:', TrustListChannelID);

            // Fetch the roles and channel from the guild cache
            const trustedRole = TrustedRoleID ? interaction.guild.roles.cache.get(TrustedRoleID) : null;
            const untrustedRole = UntrustedRoleID ? interaction.guild.roles.cache.get(UntrustedRoleID) : null;
            const trustListChannel = TrustListChannelID ? interaction.guild.channels.cache.get(TrustListChannelID) : null;

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
