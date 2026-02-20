// src/config.js
module.exports = {
  PLAYER_ROLE_ID: "1474452617978450065",

  // Put your room limits here:
  // "voiceChannelId": maxPlayersWithPlayerRoleAllowed
  ROOM_LIMITS: {
    "1474459696428486687": 8,
    "1474459748572336138": 4,
    "1474459762191237173": 4,
    "1474459773729505322": 2
  },

  // Main voice channel everyone gets moved to on /endround
  MAIN_VOICE_CHANNEL_ID: process.env.MAIN_VOICE_CHANNEL_ID,

  // Optional: restrict /endround to members with this admin role ID
  // If unset, anyone with Move Members permission can run it.
  ADMIN_ROLE_ID: process.env.ADMIN_ROLE_ID || null,

  // If a room is full: move them here, or disconnect if null
  OVERFLOW_VOICE_CHANNEL_ID: process.env.OVERFLOW_VOICE_CHANNEL_ID || null,
};
