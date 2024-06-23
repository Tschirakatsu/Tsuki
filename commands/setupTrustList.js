/**
 * @file    setupTrustList.js
 * @brief   implements the trustlists logic
 * @author  Created by tschi
 * @version 23/06/2024
 */

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { join } = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuptrustlist')
        .setDescription('Setup the TrustList for this server')
        .addStringOption((option) =>
            option
                .setName('admin_roles')
                .setDescription('Admin roles')
                .setRequired(true)
                .addChoices(
                    { name: 'Admin', value: 'admin' },
                    { name: 'Mod', value: 'mod' }
                )
        )
        .addStringOption((option) =>
            option
                .setName('mod_roles')
                .setDescription('Mod roles')
                .setRequired(true)
                .addChoices(
                    { name: 'Admin', value: 'admin' },
                    { name: 'Mod', value: 'mod' }
                )
        )
        .addStringOption((option) =>
            option
                .setName('trusted_role')
                .setDescription('Trusted role')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('untrusted_role')
                .setDescription('Untrusted role')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('member_role')
                .setDescription('Member role')
                .setRequired(false)
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
            const adminRoles = interaction.options.get('admin_roles').value.split(',').map((role) => role.trim());
            const modRoles = interaction.options.get('mod_roles').value.split(',').map((role) => role.trim());
            let trustedRole, untrustedRole, memberRole;
            if (interaction.options.get('trusted_role')) {
                trustedRole = await getOrCreateRole(interaction.guild, interaction.options.get('trusted_role').value, '#00ff00');
            } else {
                trustedRole = await getOrCreateRole(interaction.guild, 'Trusted', '#00ff00');
            }
            if (interaction.options.get('untrusted_role')) {
                untrustedRole = await getOrCreateRole(interaction.guild, interaction.options.get('untrusted_role').value, '#ff0000');
            } else {
                untrustedRole = await getOrCreateRole(interaction.guild, 'Untrusted', '#ff0000');
            }
            if (interaction.options.get('member_role')) {
                memberRole = await getOrCreateRole(interaction.guild, interaction.options.get('member_role').value, '#0000ff');
            } else {
                memberRole = await getOrCreateRole(interaction.guild, 'Member', '#0000ff');
            }

            // Store the role IDs in a JSON file
            const data = {
                adminRoleId: adminRoles.map((role) => getRoleById(interaction.guild, role)).join(','),
                modRoleId: modRoles.map((role) => getRoleById(interaction.guild, role)).join(','),
                trustedRoleId: trustedRole.id,
                untrustedRoleId: untrustedRole.id,
                memberRoleId: memberRole.id,
            };
            fs.writeFileSync(jsonFile, JSON.stringify(data));

            // Create a channel named "TrustList" and set the permissions
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
                    {
                        id: untrustedRole.id,
                        deny: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_APPLICATION_COMMANDS],
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY],
                    },
                    {
                        id: memberRole.id,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY],
                    },
                    {
                        id: adminRoles.map((role) => getRoleById(interaction.guild, role)).join(','),
                        allow: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_APPLICATION_COMMANDS, Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY],
                    },
                    {
                        id: modRoles.map((role) => getRoleById(interaction.guild, role)).join(','),
                        allow: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_APPLICATION_COMMANDS, Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.READ_MESSAGE_HISTORY],
                    },
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

function getRoleById(guild, roleId) {
    return guild.roles.cache.get(roleId);
}