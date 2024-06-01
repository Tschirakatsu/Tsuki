// index.js
const { Client, GatewayIntentBits, Collection } = require("discord.js");
require('dotenv').config();
const fs = require("fs");
const {token} = require("./Credentials");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Creating a collection to stock the commands
client.commands = new Collection();

// charge commands from Commands folder
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // add every command to the collection
    client.commands.set(command.data.name, command);
}

client.on("ready", async () => {
    console.log("Bot Opérationnel");

    // save slash commands
    const commands = await client.application?.commands.set(Array.from(client.commands.values()).map(command => command.data));

    console.log(`Commandes slash enregistrées : ${commands.map(command => command.name).join(", ")}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    const { commandName } = interaction;

    // verify if the command exists into the collection
    const command = client.commands.get(commandName);

    if (!command) {
        return;
    }

    try {
        // execute the command
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        interaction.reply({
            content: "Une erreur s'est produite lors de l'exécution de cette commande.",
            ephemeral: true,
        });
    }
});

client.login(token).then(r => "Bot login and working properly");