const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "mute",
        description: "Mutes a user in the server",
        options: [
            {
                name: "user",
                description: "The user to mute.",
                type: 6, // User type
                required: true,
            },
            {
                name: "duration",
                description: "The duration of the mute in minutes.",
                type: 4, // Integer type
                required: true,
            },
            {
                name: "reason",
                description: "The reason for the mute.",
                type: 3, // String type
                required: false,
            },
        ],
        defaultMemberPermissions: PermissionsBitField.Flags.ModerateMembers,
    },
    async execute(interaction) {
        const { member, options } = interaction;
        const userOption = options.getMember("user");
        const duration = options.getInteger("duration");
        const reason = options.getString("reason") || "No reason provided.";

        const moderator = interaction.user;

        // Permission checks
        if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({
                content: "You do not have permission to mute members.",
                ephemeral: true,
            });
        }

        if (!userOption.manageable) {
            return interaction.reply({
                content: "I cannot mute this user. They might have higher permissions than me.",
                ephemeral: true,
            });
        }

        if (userOption.id === moderator.id) {
            return interaction.reply({
                content: "You cannot mute yourself.",
                ephemeral: true,
            });
        }

        // Convert duration to milliseconds and apply timeout
        const timeoutDuration = duration * 60 * 1000;

        try {
            await userOption.timeout(timeoutDuration, reason);

            const muteEmbed = new EmbedBuilder()
                .setTitle("User Muted")
                .setDescription(`${userOption.user.tag} has been muted in this server!`)
                .addFields(
                    { name: "Moderator", value: moderator.tag, inline: true },
                    { name: "Muted User", value: userOption.user.tag, inline: true },
                    { name: "Duration", value: `${duration} minute(s)`, inline: true },
                    { name: "Reason", value: reason, inline: true }
                )
                .setThumbnail(userOption.user.displayAvatarURL({ dynamic: true }))
                .setColor("#ff9900");

            await interaction.reply({ embeds: [muteEmbed] });
        } catch (error) {
            console.error("Failed to mute user:", error);
            interaction.reply({
                content: "There was an issue while trying to mute the user.",
                ephemeral: true,
            });
        }
    },
};