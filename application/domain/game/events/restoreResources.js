() => ({
  init: function () {
    const { game, player, source: card } = this.eventContext();

    const eventData = { company: {} };

    if (player.gameMaster) {
      for (const player of game.players()) {
        for (const company of player.decks.company.items()) {
          if (company === card) continue;
          eventData.company[company.id()] = { selectable: true };
        }
      }
    } else {
      for (const company of player.decks.company.items()) {
        if (company === card) continue;
        if (!company.needRestoreResources()) continue;

        eventData.company[company.id()] = { selectable: true };
      }
    }

    eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
    player.set({
      eventData,
      staticHelper: { text: `Необходимо выбрать предприятие для восстановления ресурсов` },
    });
  },
  handlers: {
    TRIGGER({ target: company }) {
      const { game, player } = this.eventContext();

      company.restoreResources();

      return this.emit('RESET', { success: true });
    },
    RESET({ success } = {}) {
      const { game, player, beforeEventControlBtn: controlBtn } = this.eventContext();
      const skipRound = player.eventData.deal?.skipRound || false;

      player.set(
        { eventData: { controlBtn, company: null }, staticHelper: null },
        { reset: ['eventData.controlBtn', 'staticHelper'] }
      );

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();

      if (skipRound) {
        game.set({ roundStep: 'ROUND_END' });

        const gameMaster = game.gameMaster();
        if (gameMaster) gameMaster.set({ eventData: { controlBtn: { label: 'Завершить раунд' } } });
        player.set(
          {
            staticHelper: { text: `Ход завершен по причине восстановления ресурсов` },
            eventData: {
              deal: null,
              ...{
                playDisabled: true,
                enableControlBtn: gameMaster ? false : true,
                controlBtn: { label: 'Завершить раунд' },
              },
            },
          },
          { reset: ['eventData.deal'] }
        );
      }
    },
  },
});
