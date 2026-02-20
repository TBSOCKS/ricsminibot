const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

const {
  PLAYER_ROLE_ID,
  ROOM_LIMITS,
  MAIN_VOICE_CHANNEL_ID,
  ADMIN_ROLE_ID,
  OVERFLOW_VOICE_CHANNEL_ID,
} = require("./config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
});

// ---- Room limit enforcement ----
client.on("voiceStateUpdate", async (_oldState, newState) => {
  // only care about joins/moves INTO a channel
  if (!newState.channelId) return;

  const limit = ROOM_LIMITS[newState.channelId];
  if (!limit) return; // not a monitored room

  const member = newState.member;
  if (!member) return;

  // enforce only for Player role
  if (!member.roles.cache.has(PLAYER_ROLE_ID)) return;

  const channel = newState.channel;
  if (!channel) return;

  // count players in room
  const playersInRoom = channel.members.filter((m) =>
    m.roles.cache.has(PLAYER_ROLE_ID)
  ).size;

  if (playersInRoom > limit) {
    try {
      if (OVERFLOW_VOICE_CHANNEL_ID) {
        await member.voice.setChannel(
          OVERFLOW_VOICE_CHANNEL_ID,
          "Room is full (Player limit reached)"
        );
      } else {
        await member.voice.setChannel(
          null,
          "Room is full (Player limit reached)"
        ); // disconnect
      }
    } catch (err) {
      console.error("Failed to enforce room limit:", err);
    }
  }
});

// ---- /endround command ----
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "endround") return;

  const member = interaction.member;

  const hasAdminRole = ADMIN_ROLE_ID
    ? member.roles.cache.has(ADMIN_ROLE_ID)
    : false;

  const hasMoveMembersPerm = member.permissions.has(
    PermissionsBitField.Flags.MoveMembers
  );

  if (!hasAdminRole && !hasMoveMembersPerm) {
    return interaction.reply({
      content: "You don’t have permission to use `/endround`.",
      ephemeral: true,
    });
  }

  const guild = interaction.guild;
  if (!guild) return;

  const mainChannel = guild.channels.cache.get(MAIN_VOICE_CHANNEL_ID);
  if (!mainChannel || mainChannel.type !== ChannelType.GuildVoice) {
    return interaction.reply({
      content: "Main voice channel is not set correctly.",
      ephemeral: true,
    });
  }

  await interaction.reply({
    content: "Ending round… moving everyone back to Main.",
    ephemeral: true,
  });

  // ensure we have full member list
  await guild.members.fetch();

  const movePromises = [];
  guild.members.cache.forEach((m) => {
    const vc = m.voice?.channel;
    if (!vc) return;
    if (vc.id === MAIN_VOICE_CHANNEL_ID) return;

    movePromises.push(
      m.voice.setChannel(MAIN_VOICE_CHANNEL_ID, "/endround").catch(() => null)
    );
  });

  await Promise.all(movePromises);

  await interaction.editReply({
    content: `Round ended ✅ Moved ${movePromises.length} member(s) to Main.`,
  });
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
