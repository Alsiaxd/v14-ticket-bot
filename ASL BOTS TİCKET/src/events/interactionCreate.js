const { Events, InteractionType } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    const client = interaction.client;

    if (interaction.type === InteractionType.ApplicationCommand) {
      if (interaction.user.bot) return;

      try {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) {
          await interaction.reply({
            content: 'Bu komut geçerli değil.',
            ephemeral: true,
          });
          return;
        }

        await command.execute(interaction, client);

      } catch (e) {
        console.error('Komut çalıştırılırken bir sorun oluştu:', e);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'Komut çalıştırılırken bir sorunla karşılaşıldı! Lütfen tekrar deneyin.',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'Komut çalıştırılırken bir sorunla karşılaşıldı! Lütfen tekrar deneyin.',
            ephemeral: true,
          });
        }
      }

    } else if (interaction.isButton()) {
    } else if (interaction.isContextMenuCommand()) {
      const contextCommand = client.contextMenuCommands.get(interaction.commandName);
      if (contextCommand) {
        try {
          await contextCommand.execute(interaction, client);
        } catch (error) {
          console.error('Context menu komut çalıştırılırken bir sorun oluştu:', error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: 'Context menu komut çalıştırılırken bir sorunla karşılaşıldı! Lütfen tekrar deneyin.',
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: 'Context menu komut çalıştırılırken bir sorunla karşılaşıldı! Lütfen tekrar deneyin.',
              ephemeral: true,
            });
          }
        }
      } else {
        await interaction.reply({
          content: 'Bu context menu komutu geçerli değil.',
          ephemeral: true,
        });
      }
    }
  },
};
