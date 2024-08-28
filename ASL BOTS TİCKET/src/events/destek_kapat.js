const discordTranscripts = require('discord-html-transcripts');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const moment = require('moment');
const ayarlar = require('../ayarlar.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'kapat') {
      
      if (!interaction.member.roles.cache.has(ayarlar.Yetkiler.yetkili)) {
        return interaction.reply({
          content: '<a:unlemsel:1233294336184160327> Uyarı Geçersiz Veya Yetersiz Yetki ',
          ephemeral: true,
        });
      }
      
      const guild = interaction.guild;
      if (!guild) {
        console.error('Sunucu bulunamadı.');
        return;
      }

      const channel = interaction.channel;
      if (!channel) {
        console.error('Kanal bulunamadı.');
        return;
      }

      const messages = await channel.messages.fetch();
      let messageContent = messages
        .filter((m) => m.author.bot !== true)
        .map(
          (m) =>
            `${new Date(m.createdTimestamp).toLocaleString('tr-TR', {
              timeZone: 'Europe/Istanbul',
            })} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        )
        .reverse()
        .join('\n');
      if (messageContent.length < 1) messageContent = 'Hiçbir şey';

      const openingTime = new Date(channel.createdTimestamp).toLocaleString('tr-TR', {
        timeZone: 'Europe/Istanbul',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
      const closingTime = new Date().toLocaleString('tr-TR', {
        timeZone: 'Europe/Istanbul',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });

      const topic = channel.topic || 'Belirtilmemiş';
      const [categoryId, openerId] = topic.split('|').map((str) => str.trim());


      const categoryUser = await guild.members.fetch(categoryId);

      const timeDifference = calculateTimeDifference(channel.createdTimestamp, Date.now());
      const authorityId = interaction.member.id;

      const transcript = await discordTranscripts.createTranscript(channel, {
        limit: -1,
        returnType: 'buffer',
        filename: 'transcript.html',
        saveImages: false,
        footerText: "ASL BOT’S",
        poweredBy: false,
        ssr: true
      });

      const attachment = new AttachmentBuilder(transcript, { name: `${channel.id}.html` });

      try {
      
        const logmesaj = new EmbedBuilder()
          .setAuthor({ 
            name: `ASL BOT’S DESTEK SİSTEMİ LOG VERİLERİ`, 
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTitle("**BİR DESTEK TALEBİ KAPATILDI!**")
          .setDescription(`
             <:8676gasp:1233279834600378441> **»** \`DESTEK OLUŞTURAN KİŞİ\`: <@${categoryId}>
            
           <a:devil:1233284231376142399> **»** \`DESTEK KAPATAN YETKİLİ\`: <@${interaction.user.id}>
            
            **» DESTEK KANALINI**\n\`\`\`ansi\n${channel.name}\`\`\`
            **» DESTEK AÇILMA - KAPATILMA**\n\`\`\`ansi\n${moment(openingTime, 'DD MMMM YYYY HH:mm', 'tr').format('D MMMM YYYY HH:mm')} - ${moment(closingTime, 'DD MMMM YYYY HH:mm', 'tr').format('D MMMM YYYY HH:mm')}\nDESTEK SÜRESİ: ${timeDifference}\`\`\`
          `)
          .setFooter({ text: `ASL BOT’S` });

     
        await guild.channels.cache
          .get(ayarlar.ticketLog)
          .send({
            embeds: [logmesaj],
          })
          .catch(() => console.log('Destek talepleri için log kanalını bulamadım.'));

      
        await guild.channels.cache
          .get(ayarlar.ticketLog)
          .send({
            files: [attachment],
          });

        const countdownEmbed = new EmbedBuilder()
          .setColor('#0d0d0d')
          .setDescription(`\`Ticket Kapatan:\`<@!${interaction.user.id}>\n\n***Destek talebi 5 saniye sonra kapatılacaktır!***`);

        const countdownMessage = await interaction.reply({ embeds: [countdownEmbed] });

        for (let i = 4; i >= 0; i--) {
          countdownEmbed.setDescription(`\`Ticket Kapatan:\`<@!${interaction.user.id}>\n\n***Destek talebi ${i} saniye sonra kapatılacaktır!***`);
          await countdownMessage.edit({ embeds: [countdownEmbed] });
          await sleep(1000); 
        }

        countdownEmbed.setDescription('Destek talebi kapatılıyor...');
        await countdownMessage.edit({ embeds: [countdownEmbed] });

        setTimeout(() => {
          channel.delete();
        }, 1000);
      } catch (err) {
        console.error('Kapatma bilgileri kaydedilirken bir hata oluştu:', err);
        return;
      }
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateTimeDifference(start, end) {
  const difference = end - start;
  const minutes = Math.floor(difference / 60000);
  const seconds = ((difference % 60000) / 1000).toFixed(0);
  return `${minutes} dakika ${seconds} saniye`;
}
