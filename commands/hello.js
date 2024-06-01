/**
 * @file   hello.js
 * @brief  This command is used to say hello to someone and specify a reason
 * @author Created by Tschirakatsu
 * @version 26.9.2023
 */


module.exports = {
    data: {
        name: "hello",
        description: "say hello to someone",
        options: [
            {
                name: "user",
                description: "say hello to who ?",
                type: 6,
                required: true,
            },
            {
                name: "reason",
                description: "but why ?",
                type: 3,
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const { options } = interaction;
        const userOption = options.getMember("user");
        const reasonOption = interaction.options.getString('reason');
        const user = interaction.user;

        // Mentionner l'utilisateur dans la réponse à l'interaction
        interaction.reply({
            content: `${user} is saying hello to ${userOption.toString()} because ${reasonOption}`,
            ephemeral: false,
        });
    },
};