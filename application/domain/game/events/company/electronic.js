() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  data: {
    price: null,
  },
  init: function () {
    const { game, player, source: card } = this.eventContext();

    const eventData = { company: {} };

    if (player.gameMaster) {
      for(const player of game.players()) {
        for (const company of player.decks.company.items()) {
          if (company === card) continue;
          eventData.company[company.id()] = { selectable: true };
        }
      }
    } else {
      for (const company of player.decks.company.items()) {
        if (company === card) continue;
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

      player.set(
        { eventData: { controlBtn, company: null }, staticHelper: null },
        { reset: ['eventData.controlBtn', 'staticHelper'] }
      );

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
