const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
      name: "help",
      description: "Display help for the bot commands.",
  },
  async execute(interaction) {
    const user = interaction.user;
    const helpEmbed = new EmbedBuilder()
        .setTitle('Help Commands')
        .setDescription(`Here are the available commands and their usage.\n`)
        .addFields(
            { name: '/ban', value: 'Ban a user from the server. This command will send a ban message, log the ban to the designated channel, and create a thread in that channel for further discussion about the ban.' },
            { name: '/hello', value: 'Say hello to someone with a personalized reason. The bot will respond with an embed containing a random GIF of saying "Hello!"' }
        )
        .setFooter({text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL({dynamic: true})}); // Footer with the user who invoked the command
    interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};