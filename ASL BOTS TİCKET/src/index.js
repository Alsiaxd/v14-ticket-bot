const { Client, Collection, Events, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { readdirSync } = require('fs');
const moment = require('moment');

// Botu oluşturma
const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
  shards: 'auto',
});


const config = require('./config.js');
const ayarlar = require('./ayarlar.json');


const token = config.token;
client.commandAliases = new Collection();
client.commands = new Collection();
client.slashCommands = new Collection();
client.slashData = [];


function log(message) {
  console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ${message}`);
}
client.log = log;


const loadCommands = async () => {
  const commandFiles = readdirSync('./komutlar').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./komutlar/${file}`);
    if (command.data) {
      client.slashData.push(command.data.toJSON());
      client.slashCommands.set(command.data.name, command);
      console.log(`Loaded command: ${command.data.name}`);
    } else {
      console.error(`Error loading command from file ${file}: 'data' is undefined`);
    }
  }
};


const loadEvents = async () => {
  const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
};

// Otorol verilmesi
client.on(Events.GuildMemberAdd, async member => {
  try {
    const otorolID = '1272469316742418553'; 
    const logChannelID = '1275762969896161300'; 


    await member.roles.add(otorolID);

    // Log kanalına mesaj gönder
    const logChannel = await member.guild.channels.fetch(logChannelID);
    const logEmbed = new EmbedBuilder()
      .setColor('#0c0c0c')
      .setTitle('ASL BOT’S ® OTOROL SİSTEMİ')
      .setFooter({ text: ayarlar.Embed.footerText, iconURL: ayarlar.Resimler.moderasyonURL })
      .addFields(
        { name: '<a:mcsaat:1233283897660411964>・`Tarih:`', value: `\`${moment().format('LLL')}\``, inline: true },
        { name: '<a:devil:1233284231376142399>・`Rol:`', value: `<@&${otorolID}>`, inline: true },
        { name: '<:8676gasp:1233279834600378441>・`Kullanıcı:`', value: `<@${member.user.id}>`, inline: true }
      );

    await logChannel.send({ embeds: [logEmbed] });

  } catch (error) {
    console.error('Error in guildMemberAdd event:', error);
  }
});

// Hataları yakalama
process.on('unhandledRejection', e => console.error('Unhandled Rejection:', e));
process.on('uncaughtException', e => console.error('Uncaught Exception:', e));
process.on('uncaughtExceptionMonitor', e => console.error('Uncaught Exception Monitor:', e));

// Botu başlatma
const startBot = async () => {
  await loadCommands();
  await loadEvents();
  client.login(token);
};

startBot();