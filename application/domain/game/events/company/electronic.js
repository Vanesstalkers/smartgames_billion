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
    for (const company of player.decks.company.items()) {
      if (company === card) continue;
      eventData.company[company.id()] = { selectable: true };
    }

    this.data.beforeEventControlBtn = lib.utils.clone(player.eventData.controlBtn);
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
      const { game, player } = this.eventContext();

      player.set({
        eventData: { company: null, controlBtn: { ...this.data.beforeEventControlBtn, resetEvent: null } },
        staticHelper: null,
      });

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
