/**
 * @file    unban.js
 * @brief   quick description of the purpose of the file
 * @author  Created by tschi
 * @version 11/08/2024
 */

const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "unban",
        description: "Unban a user from the server.",
        options: [
            {
                name: "user-id",
                description: "The ID of the user to unban.",
                type: 3, // String type to input the user ID
                required: true,
            },
            {
                name: "reason",
                description: "The reason for unbanning the user.",
                type: 3, // String type
                required: true,
            },
        ],
        defaultMemberPermissions: PermissionsBitField.Flags.BanMembers,
    },
    async execute(interaction) {
        const { member, options } = interaction;
        const userId = options.getString("user-id");
        const reason = options.getString("reason");

        // Check if the member has the BanMembers permission
        if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            interaction.reply({
                content: "You do not have permissions to unban members.",
                ephemeral: true, // Makes the reply visible only to the executor and discardable.
            });
            return;
        }

        try {
            // Attempt to unban the user
            await interaction.guild.members.unban(userId, reason);

            const unbanEmbed = new EmbedBuilder()
                .setTitle('User Unbanned')
                .setDescription(`User with ID ${userId} has been unbanned from this server!`)
                .addFields(
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: true }
                )
                .setColor('#00FF00'); // Green color for unban embed

            interaction.reply({ embeds: [unbanEmbed] });
        } catch (error) {
            // Handle errors, such as if the user ID is invalid or the user is not banned
            interaction.reply({
                content: `Failed to unban user with ID ${userId}. Make sure the ID is correct and the user is banned.`,
                ephemeral: true,
            });
        }
    },
};
