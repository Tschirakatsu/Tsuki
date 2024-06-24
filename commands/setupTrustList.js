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
const DBConnector = require('../DBConnector');

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
        ),
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
            if (existingServer.length > 0) {
                await interaction.reply({
                    content: 'Error: Server ID already exists in the database.',
                    ephemeral: true,
                });
                await db.close();
                console.error('Error: Server ID already exists in the database.');
                return;
            }

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

            // Store the role IDs in the database
            await db.query(`INSERT INTO Servers (ServerID, ServerName) VALUES (?, ?)`, [guildId, interaction.guild.name]);
            await db.query(`INSERT INTO Roles (RoleID, ServerID, RoleName, RoleColor) VALUES (?, ?, ?, ?)`, [adminRole.id, guildId, adminRole.name, adminRole.color]);
            await db.query(`INSERT INTO Roles (RoleID, ServerID, RoleName, RoleColor) VALUES (?, ?, ?, ?)`, [modRole.id, guildId, modRole.name, modRole.color]);
            await db.query(`INSERT INTO Roles (RoleID, ServerID, RoleName, RoleColor) VALUES (?, ?, ?, ?)`, [trustedRole.id, guildId, trustedRole.name, trustedRole.color]);
            await db.query(`INSERT INTO Roles (RoleID, ServerID, RoleName, RoleColor) VALUES (?, ?, ?, ?)`, [untrustedRole.id, guildId, untrustedRole.name, untrustedRole.color]);
            await db.query(`INSERT INTO Roles (RoleID, ServerID, RoleName, RoleColor) VALUES (?, ?, ?, ?)`, [memberRole.id, guildId, memberRole.name, memberRole.color]);
            await db.query(`INSERT INTO TrustList (ServerID, AdminRoleID, ModRoleID, TrustedRoleID, UntrustedRoleID, MemberRoleID, TrustListChannelID) VALUES (?, ?, ?, ?, ?, ?, ?)`, [guildId, adminRole.id, modRole.id, trustedRole.id, untrustedRole.id, memberRole.id, trustlistChannel.id]);
            await db.close();

            // Create an embed for the trustlist setup
            const embed = new EmbedBuilder()
                .setTitle('TrustList Setup')
                .setDescription(`This channel has been set up as the trustlist for the server '${interaction.guild.name}'`)
                .setColor('#0099ff') // Blue color for embed
                .addFields([
                    {
                        name: 'Roles',
                        value: `${trustedRole.name}`,
                        value:`${untrustedRole.name}`,
                        value:`${memberRole.name}`,
                        inline: true,
                    },
                    {
                        name: 'Description',
                        value: 'This is a description of the trustlist',
                        inline: false,
                    },
                ]);

            await trustlistChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'Error occurred. Please try again later.',
                ephemeral: true,
            });
        } finally {
            interaction.reply({
                content: 'Command completed successfully.',
                ephemeral: true,
            });
        }
    }
};

async function getOrCreateRole(guild, roleName, color) {
    try {
        const existingRole = guild.roles.cache.find((role) => role.name.toLowerCase().includes(roleName.toLowerCase()));
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