const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionsBitField, StringSelectMenuBuilder } = require('discord.js');
const ayarlar = require('../ayarlar.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-kurulum')
    .setDescription('Ticket Oluşturulacak Embedi Atar.'),

  async execute(interaction) {
    const yetkilirolid = ayarlar.Yetkiler.yetkili;
    const authorURL = ayarlar.Resimler.moderasyonURL;
    const guildIconURL = ayarlar.Resimler.moderasyonURL;

    const kullaniciRolleri = interaction.member.roles.cache;
    const yetkiliMi = ayarlar.Yetkiler.Staff.some(rolID => kullaniciRolleri.has(rolID));
    const admin = interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles);

    if (!yetkiliMi && !admin) {
      const uyarı = new EmbedBuilder()
        .setColor('000080')
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setDescription('・ Uyarı: Yetersiz veya geçersiz yetki.')
        .setTimestamp();

      return interaction.reply({
        embeds: [uyarı],
        ephemeral: true,
      });
    }

    const ticket = new EmbedBuilder()
    .setAuthor({
      name: 'ASL BOT’S® - DESTEK SİSTEMİ',
      iconURL: authorURL,
      url: 'https://discord.gg/aslbots'
    })
    .setDescription(
      `<a:utility:1233294337048051794> ・\`ᴅᴇꜱᴛᴇᴋ ꜱıꜱᴛᴇᴍı:・\`<:onday:1233294312046067712>
      <:8676gasp:1233279834600378441>・\` ᴅᴇꜱᴛᴇᴋ ʙıʟɢɪ:・\` <#1275125946264846387>
      
      <:claim:1233284110647033897>・*Lütfen Sorunuz İle* **Eşleşen Başlığı** *Seçerek Destek Talebi Açınız Ve Ticket Kurallarına Uyunuz.*
      
      **DESTEK SAATLERİ:**
      \`\`\`fix\n» 09:00 - 22:00\`\`\``
    )
    .setColor('#000080')
    .setThumbnail('https://i.ibb.co/7YHHJPz/aslgif1-min.gif')
    .setImage('https://i.ibb.co/7YHHJPz/aslgif1-min.gif')
    .setFooter({
      text: 'Destek Sistemi',
      iconURL: guildIconURL
    });
  

    const selectmenu = new StringSelectMenuBuilder()
      .setCustomId('selectmenu')
      .setPlaceholder(`📧 Lütfen Sorunuz İle Eşleşen Başlığı Seçiniz!`)
      .addOptions([
        { label: ' ꜰɪᴠᴇᴍ ᴘᴀᴋᴇᴛɪ', value: 'fivempaket', emoji: '<:fivem:1233294274276102144>' },
        { label: ' ᴇᴋɪᴘ ʙᴏᴛᴜ', value: 'ekipbotu', emoji: '<:developer:1275482004644954214>' },
        { label: ' ᴅɪɢᴇʀ', value: 'diğer', emoji: '<a:discorsel:1233284236312842342>' },
        { label: ' ʙɪʟɢɪ ᴀʟᴍᴀ', value: 'bilgialma', emoji: '<a:mesaj:1233294294635384842>' },
        { label: ' ʜᴀᴛᴀ ʙɪʟᴅɪʀɪ', value: 'hata', emoji: '<a:error_strobe:1275481028663836774>' },
        { label: ' ᴘᴀʀᴛɴᴇʀʟɪᴋ', value: 'partner', emoji: '<a:blobgift:1233283899199590400>' },
        { label: ' ꜱᴇᴄ̧ɪᴍ ꜱıꜰıʀʟᴀ', value: 'sifirla', emoji: '<a:Minecraft_enchanted_book:1233283748766814218>' }
      ]);

    const buttonRow = new ActionRowBuilder()
      .addComponents(selectmenu);

    await interaction.reply({ embeds: [ticket], components: [buttonRow] });
  },
};
