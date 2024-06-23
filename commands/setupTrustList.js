const { SlashCommandBuilder, Permissions, MessageEmbed } = require('discord.js');
const fs = require('fs');
const { join } = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuptrustlist')
        .setDescription('Setup the TrustList for this server')
        .addRoleOption((option) =>
            option
                .setName('allowed_roles')
                .setDescription('Roles allowed to send messages and use commands in the trustlist channel')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const guildId = interaction.guild.id;
            const trustlistsPath = join(__dirname, 'Trustlists', 'Servers');
            if (!fs.existsSync(trustlistsPath)) {
                fs.mkdirSync(trustlistsPath, { recursive: true });
            }
            const jsonFile = `${trustlistsPath}/${guildId}.json`; // Generate a JSON file with ServerID as filename

            // Create or fetch the roles
            const trustedRole = await getOrCreateRole(interaction.guild, 'Trusted', '#00ff00');
            const untrustedRole = await getOrCreateRole(interaction.guild, 'Untrusted', '#ff0000');
            const memberRole = await getOrCreateRole(interaction.guild, 'Member', '#0e70bb');

            // Store the role IDs in a JSON file
            const data = {
                trustedRoleId: trustedRole.id,
                untrustedRoleId: untrustedRole.id,
                memberRoleId: memberRole.id,
            };
            fs.writeFileSync(jsonFile, JSON.stringify(data));

            // Get the allowed roles from the interaction options
            const allowedRoles = interaction.options.get('allowed_roles').map((role) => role.id);
            // Create a channel named "TrustList" and send an embed
            const trustlistChannel = await interaction.guild.channels.create('TrustList', {
                type: 'GUILD_TEXT',
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_APPLICATION_COMMANDS],
                    },
                    ...allowedRoles.map((roleId) => ({
                        id: roleId,
                        allow: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_APPLICATION_COMMANDS, Permissions.FLAGS.MANAGE_ROLES],
                    })),
                ],
            });

            // Create an embed for the trustlist setup
            const embed = new MessageEmbed()
                .setTitle('TrustList Setup')
                .setDescription(`This channel has been set up as the trustlist for the server '${interaction.guild.name}'`)
                .setColor('#0099ff'); // Blue color for embed

            await trustlistChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply('Error setting up trustlist. Please try again later.');
        }
    },
};

async function getOrCreateRole(guild, roleName, color) {
    try {
        const existingRole = guild.roles.cache.find((role) => role.name === roleName);
        if (existingRole) {
            return existingRole;
        } else {
            return await guild.roles.create({
                name: roleName,
                color: color,
            });
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to create or fetch role');
    }
}