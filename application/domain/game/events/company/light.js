() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  data: {
    sourceDeck: null,
    gameMasterAction: null,
  },
  init: function ({ sourceDeck, gameMasterAction } = {}) {
    const { game, player } = this.eventContext();
    this.data.gameMasterAction = gameMasterAction;

    const eventData = { deck: {} };
    for (const deck of Object.values(game.decks)) {
      if (deck.items().length === 0) continue;
      eventData.deck[deck.id()] = { selectable: true };
    }

    eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
    player.set({
      eventData,
      staticHelper: { text: 'Необходимо выбрать новое предприятие (из колоды)', buttons: null },
    });

    if (sourceDeck) {
      // player.set({ staticHelper: { text: 'Какую организацию нужно заменить?', buttons: null } });
      this.emit('TRIGGER', { target: sourceDeck });
    }
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();
      let { targetPlayer, price } = this.data.gameMasterAction || {};
      if (!targetPlayer) targetPlayer = player; // логика для gameMaster

      if (!this.data.sourceDeck) {
        this.data.sourceDeck = target;

        const eventData = { deck: null, company: {} };
        for (const company of targetPlayer.decks.company.items()) {
          if (this.data.sourceDeck.subtype === company.subtype) continue; // нельзя менять на такое же предприятие
          if (company.foreignResources().length > 0) continue; // нельзя менять на предприятие с чужими ресурсами

          eventData.company[company.id()] = { selectable: true };
        }
        player.set({ eventData, staticHelper: { text: 'Какую организацию нужно заменить?', buttons: null } });

        return { preventListenerRemove: true };
      } else {
        const oldCompany = target;
        const outerChip = oldCompany.decks.outer.items()[0];
        const newCompany = this.data.sourceDeck.getRandomItem();

        oldCompany.moveToTarget(game.decks[oldCompany.subtype]);
        newCompany.moveToTarget(targetPlayer.decks.company, { restoreResources: true });

        if (outerChip) outerChip.moveToTarget(newCompany.decks.outer);

        // замена предприятия из useDeck
        if (!price) price = targetPlayer.eventData.deal.price;
        if (price) targetPlayer.set({ money: targetPlayer.money - price });

        return this.emit('RESET', { success: true });
      }
    },
    RESET({ success } = {}) {
      const { game, player, beforeEventControlBtn: controlBtn } = this.eventContext();

      player.set(
        { eventData: { controlBtn, deck: null, company: null, deal: null }, staticHelper: null },
        { reset: ['eventData.controlBtn', 'staticHelper'] }
      );

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
