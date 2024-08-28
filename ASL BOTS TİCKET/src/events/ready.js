const { ActivityType, Events } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { exec } = require('child_process');
const ayarlar = require('../ayarlar.json');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const rest = new REST({ version: '10' }).setToken(client.token);

        // Botun hazır olduğunu bildirir
        console.log(`${client.user.username} Aktif Edildi!`);

        try {
            // Slash komutlarını kaydeder
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: client.slashData }
            );
            console.log('Slash komutları başarıyla kaydedildi.');
        } catch (error) {
            console.error('Slash komutları kaydedilirken bir hata oluştu:', error);
        }

        // Sunucuyu bulur
        const guild = client.guilds.cache.get(ayarlar.Bot.SunucuID);
        if (guild) {
            const updateActivity = () => {
                const memberCount = guild.memberCount;
                client.user.setActivity(`ASL Bot's Üyeleri İle İlgileniyor: ${memberCount}`, {
                    type: ActivityType.Playing
                });
            };

            // İlk durumu günceller
            updateActivity();

            // 10 saniyede bir durumu günceller
            setInterval(updateActivity, 10000);

            // 5 dakikada bir botu yeniden başlatır
            setInterval(() => {
                console.log('Bot yeniden başlatılıyor...');
                exec('pm2 restart <app_name>', (error, stdout, stderr) => {
                    if (error) {
                        console.error('Hata:', error.message);
                        return;
                    }
                    if (stderr) {
                        console.error('Stderr:', stderr);
                        return;
                    }
                    console.log('Stdout:', stdout);
                });
            }, 300000); // 5 dakika (300000 ms)
        } else {
            // Sunucu bulunamazsa
            client.user.setActivity('Sunucu bulunamadı', {
                type: ActivityType.Playing
            });
        }
    }
};