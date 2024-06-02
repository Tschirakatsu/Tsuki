/**
 * @file    Help.js
 * @brief   to require help on bot's commands
 * @author  Created by tschi
 * @version 02/06/2024
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: "help",
        description: "Show help messages for this bot",
    },
    async execute(interaction) {
        const user = interaction.user.tag;

        const HelpEmbed = new EmbedBuilder()
            .setTitle('Documentation du Bot Tsuki')
            .setDescription(`demandée par ${user}`)
            .addFields(
                {name: '/Hello', value: "Cette commande est utilisée pour dire bonjour a quelqu'un, n'importe qui, cela va retourner un embed avec un bonjour et un gif random depuis mon ptit ficher JSON", inline: true},
                {name: '/ban', value: "commande ban, restreinte aux personnes ayant les droits, si vous avez les droits, les paramètres demandés sont l'utilisateur et la raison, si vous ajouter le log-chanel dans nya-ban ça va copier l'embed de ban et créer un thread publique pour que les gens puissent trashtalk le banni.", inline: true}
            )
            .setColor('#FF0000'); // Red color for ban embed

            interaction.reply({ embeds: [HelpEmbed] });
    }
}