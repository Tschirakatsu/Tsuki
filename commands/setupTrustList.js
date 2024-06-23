/**
 * @file    setupTrustList.js
 * @brief   implements the trustlists logic
 * @author  Created by tschi
 * @version 23/06/2024
 */

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const permissions = {
    SendMessages: 8,
    UseApplicationCommands: 1024,
    ViewChannel: 32,
    ReadMessageHistory: 262144,
};
const fs = require('fs');
const { join } = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuptrustlist')
        .setDescription('Setup the TrustList for this server')
        .addRoleOption((option) =>
            option
                .setName('admin_role')
                .setDescription('Admin role')
                .setRequired(true)
        )
        .addRoleOption((option) =>
            option
                .setName('mod_role')
                .setDescription('Mod role')
                .setRequired(true)
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
            let adminRole, modRole, trustedRole, untrustedRole, memberRole;
            if (interaction.options.get('admin_role')) {
                adminRole = interaction.options.get('admin_role').role;
            } else {
                await interaction.reply('Error: No admin role provided');
                return;
            }
            if (interaction.options.get('mod_role')) {
                modRole = interaction.options.get('mod_role').role;
            } else {
                await interaction.reply('Error: No mod role provided');
                return;
            }
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
                adminRoleId: adminRole.id,
                modRoleId: modRole.id,
                trustedRoleId: trustedRole.id,
                untrustedRoleId: untrustedRole.id,
                memberRoleId: memberRole.id,
            };
            fs.writeFileSync(jsonFile, JSON.stringify(data));

            // Create a channel named "TrustList" and set the permissions
            const trustlistChannel = await interaction.guild.channels.create({
                name: 'TrustList', // Add the name property here
                type: 0,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.UseApplicationCommands],
                    },
                    {
                        id: trustedRole.id,
                        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.UseApplicationCommands],
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                    {
                        id: untrustedRole.id,
                        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.UseApplicationCommands],
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                    {
                        id: memberRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                    {
                        id: adminRole.id,
                        allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.UseApplicationCommands, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                    {
                        id: modRole.id,
                        allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.UseApplicationCommands, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                ],
            });

            // Create an embed for the trustlist setup
            const embed = new EmbedBuilder()
                .setTitle('TrustList Setup')
                .setDescription(`This channel has been set up as the trustlist for the server '${interaction.guild.name}'`)
                .setColor('#0099ff'); // Blue color for embed

            await trustlistChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'Error setting up trustlist. Please try again later.',
                ephemeral: true,
            });
        } finally {
            // Add a timeout here
            setTimeout(() => {
                interaction.reply({
                    content: 'Command completed successfully.',
                    ephemeral: true,
                });
            }, 5000); // 5-second timeout
        }
    }
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