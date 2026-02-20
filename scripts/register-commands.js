const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("endround")
    .setDescription("Move everyone back to the Main voice channel.")
    .toJSON(),
];

async function main() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId || !guildId) {
    throw new Error("Missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID env vars.");
  }

  const rest = new REST({ version: "10" }).setToken(token);

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands,
  });

  console.log("✅ Registered /endround for this guild");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
