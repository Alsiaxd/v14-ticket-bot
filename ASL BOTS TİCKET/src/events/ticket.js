const { PermissionsBitField, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ayarlar = require('../ayarlar.json');
const moment = require("moment");
const fs = require('fs');
require("moment-duration-format");
moment.locale("tr");

const categoryNames = {
    'fivempaket': 'ꜰɪᴠᴇᴍ ᴘᴀᴋᴇᴛɪ',
    'ekipbotu': 'ᴇᴋɪᴘ ʙᴏᴛᴜ',
    'diğer': 'ᴅɪɢᴇʀ',
    'bilgialma': 'ʙɪʟɢɪ ᴀʟᴍᴀ',
    'hata': 'ᴇᴋɪᴘ ʙᴏᴛᴜ',
    'partner': 'ᴘᴀʀᴛɴᴇʀʟɪᴋ',
    'sifirla': 'ꜱᴇᴄ̧ɪᴍ ꜱıꜰıʀʟᴀ'
};


let ticketCounter = 0;

if (fs.existsSync('./ticketCounter.json')) {
    const data = fs.readFileSync('./ticketCounter.json', 'utf8');
    ticketCounter = parseInt(data, 10);
}

const openTickets = new Map();

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isStringSelectMenu()) {
            const selectedCategory = interaction.values[0];
            const categoryName = categoryNames[selectedCategory];

            if (!interaction.guild) {
                return interaction.reply({
                    content: '<:onday:1233294312046067712> ***Sunucu bilgisi bulunamadı!***',
                    ephemeral: true,
                });
            }

            const guild = interaction.guild;

            if (selectedCategory === 'sifirla') {
                const openTicketChannels = guild.channels.cache.filter(channel => 
                    channel.type === ChannelType.GuildText && channel.topic && channel.topic.startsWith(`${interaction.user.id} | `)
                );
                
                openTicketChannels.forEach(async channel => {
                    await channel.delete();
                    openTickets.delete(channel.id);
                });

                return interaction.reply({
                    content: '<:onday:1233294312046067712> ***Seçim başarıyla sıfırlandı ve açık ticket\'lar kapatıldı.***',
                    ephemeral: true,
                });
            }

            if (!categoryName) {
                return interaction.reply({
                    content: '<:onday:1233294312046067712> ***Geçersiz kategori seçimi!***',
                    ephemeral: true,
                });
            }

            if (openTickets.has(interaction.user.id)) {
                return interaction.reply({
                    content: '<a:warn:1233294338491154496> **Zaten Açık Bir Talebiniz Bulunmaktadır.**',
                    ephemeral: true,
                });
            }

            const existingTicket = guild.channels.cache.find(channel => {
                if (channel.type === ChannelType.GuildText) {
                    const topic = channel.topic || '';
                    const userId = topic.split(' | ')[0];
                    return userId === interaction.user.id;
                }
                return false;
            });

            if (existingTicket) {
                return interaction.reply({
                    content: '<a:warn:1233294338491154496> **Zaten Açık Bir Talebiniz Bulunmaktadır.**',
                    ephemeral: true,
                });
            }

            // Ticket sayısını artır ve dosyaya kaydet
            ticketCounter++;
            fs.writeFileSync('./ticketCounter.json', ticketCounter.toString());

            const cleanedUsername = interaction.user.username.replace(/\s/g, '');
            const channelName = `ticket-${ticketCounter}・${cleanedUsername}`;
            const supportChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: ayarlar.parentCategory,
                topic: `${interaction.user.id} | ${categoryName}`,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles],
                    },
                    {
                        id: ayarlar.Yetkiler.yetkili,
                        allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            const embed = new EmbedBuilder()
                .setColor('#141212')
                .setAuthor({
                    name: `ᴀꜱʟ ʙᴏᴛ’ꜱ`,
                    iconURL: ayarlar.Resimler.moderasyonURL,
                })
                .setDescription(`<a:poofpinkheart:1233294316945014855> *・Lütfen yetkililerimizin mesaj yazmasını beklemeden sorununuzu anlatınız.*
                                
                <:8676gasp:1233279834600378441>  ・\`Destek Açan:・\` ${interaction.user.toString()}
                <a:5961darkbluetea:1233795662949388380> ・\`Kategori: ${categoryName}・\`
                <a:animated_clock29:1233283897660411964> ・\`Tarih: ${moment(Date.now()).format("LLL")}・\`
            `)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setImage(`https://i.ibb.co/7YHHJPz/aslgif1-min.gif`);

            const kapat = new ButtonBuilder()
                .setCustomId('kapat')
                .setLabel('ᴛɪᴄᴋᴇᴛɪ ᴋᴀᴘᴀᴛ')
                .setStyle(ButtonStyle.Danger) 
                .setEmoji('<a:closex:1233284111893004311> ');
        
            const reportButton = new ButtonBuilder()
                .setCustomId('report')
                .setLabel('ʙɪʟᴅɪʀ')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('<:onday:1233294312046067712>');

            const purchaseButton = new ButtonBuilder()
                .setCustomId('purchase')
                .setLabel('ᴘᴜʀᴄʜᴀꜱᴇ')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('<:alveriremovebgpreview:1275494974418321541>');
            
            const actionRow = new ActionRowBuilder()
                .addComponents(kapat, purchaseButton, reportButton);
            
            await supportChannel.send({ content: `${interaction.user.toString()} | <@&${ayarlar.Yetkiler.yetkili}>`, embeds: [embed], components: [actionRow] });
            
            openTickets.set(supportChannel.id, interaction.user);
                
            const ticketaçıldı = new EmbedBuilder()
                .setColor('#141212')
                .setAuthor({
                    name: `ASL BOT’S® - DESTEK SİSTEMİ`,
                    iconURL: ayarlar.Resimler.moderasyonURL,
                })
                .setDescription(`
                    <a:utility:1233294337048051794> ・ \`ᴏʏᴜɴᴄᴜ:\` ${interaction.user.toString()}
                    <:1709locked:1233279435692572683> ・ \`ᴅᴇꜱᴛᴇᴋ ᴋᴀɴᴀʟɪ:\` <#${supportChannel.id}>
                    <a:animated_clock29:1233283897660411964> ・ \`ᴛᴀʀɪʜ: ${moment(Date.now()).format("LLL")}\`
                `);
        
            await interaction.reply({
                embeds: [ticketaçıldı],
                ephemeral: true
            });
        } 

        if (interaction.isButton()) {
            if (interaction.customId === 'kapat') {
                const ticketChannel = interaction.channel;

                if (ticketChannel && ticketChannel.type === ChannelType.GuildText) {
                    
                   
                    await ticketChannel.setName('destek-kapatılıyor');

                    const logChannelID = ayarlar.Log?.kanal; // Log kanal ID'sini ayarlardan al
                    if (!logChannelID) {
                        console.error('Log kanal ID\'si ayarlarda tanımlı değil!');
                        return;
                    }

                    const logChannel = client.channels.cache.get(logChannelID);
                    if (!logChannel) {
                        console.error('Log kanalı bulunamadı!');
                        return;
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#141212')
                        .setDescription(`**Ticket Kapandı**`)
                        .addFields(
                            { name: 'Kapatan:', value: `${interaction.user.tag}` },
                            { name: 'Kapatma Tarihi:', value: `${moment(Date.now()).format('LLL')}` }
                        );
                    
                    await logChannel.send({ embeds: [embed] });
                    await ticketChannel.delete();
                }
            }
        }
    },
};
