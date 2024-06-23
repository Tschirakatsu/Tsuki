/**
 * @file    setupTrustList.js
 * @brief   implements the trustlists logic
 * @author  Created by tschi
 * @version 23/06/2024
 */

const { SlashCommandBuilder, Permissions, MessageEmbed } = require('discord.js');
const fs = require('fs');
const { join } = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuptrustlist')
        .setDescription('Setup the TrustList for this server')
        .addMultipleSelectOption((option) =>
            option
                .setName('allowed_roles')
                .setDescription('Roles allowed to send messages and use commands in the trustlist channel')
                .setRequired(true)
                .addChoices(
                    { name: 'Admin', value: 'admin' },
                    { name: 'Mod', value: 'mod' }
                )
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
            const adminRole = await getOrCreateRole(interaction.guild, 'Admin', '#0e70bb');
            const modRole = await getOrCreateRole(interaction.guild, 'Mod', '#0e70bb');

            // Store the role IDs in a JSON file
            const data = {
                trustedRoleId: trustedRole.id,
                adminRoleId: adminRole.id,
                modRoleId: modRole.id,
            };
            fs.writeFileSync(jsonFile, JSON.stringify(data));

            // Get the allowed roles from the interaction options
            const allowedRoles = interaction.options.get('allowed_roles').map((role) => role.value);
            // Create a channel named "TrustList" and send an embed
            const trustlistChannel = await interaction.guild.channels.create('TrustList', {
                type: 'GUILD_TEXT',
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_APPLICATION_COMMANDS],
                    },
                    {
                        id: trustedRole.id,
                        deny: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_APPLICATION_COMMANDS],
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY],
                    },
                    ...allowedRoles.map((roleId) => ({
                        id: roleId === 'admin' ? adminRole.id : modRole.id,
                        allow: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_APPLICATION_COMMANDS, Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY],
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