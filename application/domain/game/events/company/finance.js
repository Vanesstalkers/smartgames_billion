() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  data: {
    price: null,
    targetPlayerId: null,
    companyDeckId: null,
  },
  init: function () {
    const { game, player } = this.eventContext();

    const eventData = { deck: {} };
    for (const deck of Object.values(game.decks)) {
      if (deck.type !== 'company') continue;
      if (deck.items().length === 0) continue;
      eventData.deck[deck.id()] = { selectable: true };
    }

    if (!player.gameMaster) {
      this.data.targetPlayerId = player.id();

      switch (player.decks.company.items().length) {
        case 1:
          this.data.price = 15;
          break;
        case 2:
          this.data.price = 28;
          break;
      }
    }

    eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
    const staticHelper = {
      text:
        `Необходимо выбрать новое предприятие (из колоды)` + player.gameMaster
          ? ``
          : `. Оно будет куплено за <b><a>${this.data.price}₽</a></b>`,
      buttons: null,
    };
    player.set({ eventData, staticHelper });
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();

      if (!this.data.companyDeckId) this.data.companyDeckId = target.id();
      else if (!this.data.targetPlayerId) this.data.targetPlayerId = target.id();

      const targetPlayer = game.get(this.data.targetPlayerId);
      if (!targetPlayer) {
        const eventData = { player: {} };
        for (const player of game.players()) {
          eventData.player[player.id()] = { selectable: true };
        }
        player.set({ eventData });
        return { preventListenerRemove: true };
      }

      if (!this.data.price) {
        switch (targetPlayer.decks.company.items().length) {
          case 1:
            this.data.price = 15;
            break;
          case 2:
            this.data.price = 28;
            break;
          default:
            this.data.price = 100;
        }
      }

      this.emit('RESET', { success: true });

      game.run(
        'buyCompany',
        { player: targetPlayer, deck: game.get(this.data.companyDeckId), price: this.data.price },
        player
      );
    },
    RESET({ success } = {}) {
      const { game, player, beforeEventControlBtn: controlBtn } = this.eventContext();

      player.set(
        { eventData: { controlBtn, player: null, deck: null }, staticHelper: null },
        { reset: ['eventData.controlBtn', 'staticHelper'] }
      );

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
