() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  data: {
    sourceDeck: null,
  },
  init: function ({ sourceDeck } = {}) {
    const { game, player } = this.eventContext();

    const eventData = { deck: {} };
    for (const deck of Object.values(game.decks)) {
      if (deck.items().length === 0) continue;
      eventData.deck[deck.id()] = { selectable: true };
    }

    this.data.beforeEventControlBtn = lib.utils.clone(player.eventData.controlBtn);
    eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
    player.set({
      eventData,
      staticHelper: { text: 'Необходимо выбрать новое предприятие (из колоды)', buttons: null },
    });

    if (sourceDeck) {
      player.set({ staticHelper: { text: 'Какую организацию нужно заменить?', buttons: null } });
      this.emit('TRIGGER', { target: sourceDeck });
    }
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();

      if (!this.data.sourceDeck) {
        this.data.sourceDeck = target;

        const eventData = { deck: null, company: {} };
        for (const company of player.decks.company.items()) {
          if (this.data.sourceDeck.subtype === company.subtype) continue; // нельзя менять на такое же предприятие
          if (company.foreignResources().length > 0) continue; // нельзя менять на предприятие с чужими ресурсами

          eventData.company[company.id()] = { selectable: true };
        }
        player.set({ eventData, staticHelper: { text: 'Какую организацию нужно заменить?', buttons: null } });

        return { preventListenerRemove: true };
      } else {
        const oldCompany = target;
        const newCompany = this.data.sourceDeck.getRandomItem();

        const outerChip = oldCompany.decks.outer.items()[0];
        if (outerChip) outerChip.moveToTarget(newCompany.decks.outer);

        oldCompany.moveToTarget(game.decks[oldCompany.subtype]);
        newCompany.moveToTarget(player.decks.company, { restoreResources: true });

        // замена предприятия из useDeck
        if (player.eventData.deal) player.set({ money: player.money - player.eventData.deal.price });

        return this.emit('RESET', { success: true });
      }
    },
    RESET({ success } = {}) {
      const { game, player } = this.eventContext();

      player.set(
        {
          eventData: {
            deck: null,
            company: null,
            deal: null, // замена предприятия из useDeck
            controlBtn: this.data.beforeEventControlBtn,
          },
          staticHelper: null,
        },
        { reset: ['eventData.controlBtn', 'staticHelper'] }
      );

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
