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

    // save slash commands
    const commands = await client.application?.commands.set(Array.from(client.commands.values()).map(command => command.data));

    console.log(`Bot up and running with commands listed here : ${commands.map(command => command.name).join(", ")}`);
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
        console.error(`Error executing ${commandName} command:`, error);
        interaction.reply({
            content: "An error occurred while processing this command. check server logs or try again",
            ephemeral: true,
        });
    }
});

client.login(token).then(r => "Bot login and working properly (or not but you'll see Lol)");