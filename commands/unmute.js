const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "unmute",
        description: "Unmutes a user in the server",
        options: [
            {
                name: "user",
                description: "The user to unmute.",
                type: 6, // User type
                required: true,
            },
            {
                name: "reason",
                description: "The reason for the unmute.",
                type: 3, // String type
                required: false,
            },
        ],
        defaultMemberPermissions: PermissionsBitField.Flags.ModerateMembers,
    },
    async execute(interaction) {
        const { member, options } = interaction;
        const userOption = options.getMember("user");
        const reason = options.getString("reason") || "No reason provided.";

        const moderator = interaction.user;

        // Permission checks
        if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({
                content: "You do not have permission to unmute members.",
                ephemeral: true,
            });
        }

        if (!userOption.manageable) {
            return interaction.reply({
                content: "I cannot unmute this user. They might have higher permissions than me.",
                ephemeral: true,
            });
        }

        if (userOption.communicationDisabledUntilTimestamp === null) {
            return interaction.reply({
                content: "This user is not muted.",
                ephemeral: true,
            });
        }

        // Remove any active timeout (unmute)
        try {
            await userOption.timeout(null, reason);

            const unmuteEmbed = new EmbedBuilder()
                .setTitle("User Unmuted")
                .setDescription(`${userOption.user.tag} has been unmuted in this server!`)
                .addFields(
                    { name: "Moderator", value: moderator.tag, inline: true },
                    { name: "Unmuted User", value: userOption.user.tag, inline: true },
                    { name: "Reason", value: reason, inline: true }
                )
                .setThumbnail(userOption.user.displayAvatarURL({ dynamic: true }))
                .setColor("#00ff00");

            await interaction.reply({ embeds: [unmuteEmbed] });
        } catch (error) {
            console.error("Failed to unmute user:", error);
            interaction.reply({
                content: "There was an issue while trying to unmute the user.",
                ephemeral: true,
            });
        }
    },
};