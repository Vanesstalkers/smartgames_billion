() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  data: {
    price: null,
  },
  init: function () {
    const { game, player } = this.eventContext();

    const eventData = { deck: {} };
    for (const deck of Object.values(game.decks)) {
      if (deck.type !== 'company') continue;
      if (deck.items().length === 0) continue;
      eventData.deck[deck.id()] = { selectable: true };
    }

    switch (player.decks.company.items().length) {
      case 1:
        this.data.price = 15;
        break;
      case 2:
        this.data.price = 28;
        break;
    }

    this.data.beforeEventControlBtn = lib.utils.clone(player.eventData.controlBtn);
    eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
    player.set({
      eventData,
      staticHelper: {
        text: `Необходимо выбрать новое предприятие (из колоды). Оно будет куплено за <b><a>${this.data.price}₽</a></b>`,
        buttons: null,
      },
    });
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();

      player.set({ money: player.money - this.data.price });
      target.getRandomItem().moveToTarget(player.decks.company, { restoreResources: true });

      return this.emit('RESET', { success: true });
    },
    RESET({ success } = {}) {
      const { game, player, source } = this.eventContext();

      player.set(
        { eventData: { deck: null, controlBtn: this.data.beforeEventControlBtn }, staticHelper: null },
        { reset: ['eventData.controlBtn', 'staticHelper'] }
      );

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
