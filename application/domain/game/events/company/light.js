() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  data: {
    sourceDeckId: null,
    targetPlayerId: null,
    price: null,
  },
  init: function ({ sourceDeck, targetPlayerId, price } = {}) {
    const { game, player } = this.eventContext();

    this.data.targetPlayerId = targetPlayerId;
    this.data.price = price;

    const eventData = { deck: {} };
    for (const deck of Object.values(game.decks)) {
      if (deck.items().length === 0) continue;
      eventData.deck[deck.id()] = { selectable: true };
    }

    if (!player.gameMaster) {
      this.data.targetPlayerId = player.id();
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
      const { game, player, data: { sourceDeckId, targetPlayerId } = {} } = this.eventContext();
      const sourceDeck = game.get(sourceDeckId);

      if (!sourceDeckId) {
        this.data.sourceDeckId = target.id();

        const eventData = { deck: null, company: {} };
        const players = targetPlayerId ? [game.get(targetPlayerId)] : game.players();
        for (const player of players) {
          for (const company of player.decks.company.items()) {
            if (sourceDeck.subtype === company.subtype) continue; // нельзя менять на такое же предприятие
            if (company.foreignResources().length > 0) continue; // нельзя менять на предприятие с чужими ресурсами

            eventData.company[company.id()] = { selectable: true };
          }
        }
        player.set({ eventData, staticHelper: { text: 'Какую организацию нужно заменить?', buttons: null } });

        return { preventListenerRemove: true };
      } else {
        const oldCompany = target;
        const targetPlayer = oldCompany.findParent({ className: 'Player' });
        const outerChip = oldCompany.decks.outer.items()[0];
        const newCompany = sourceDeck.getRandomItem();

        oldCompany.moveToTarget(game.decks[oldCompany.subtype]);
        newCompany.moveToTarget(targetPlayer.decks.company, { restoreResources: true });

        if (outerChip) outerChip.moveToTarget(newCompany.decks.outer);

        // замена предприятия из useDeck
        if (!this.data.price) this.data.price = targetPlayer.eventData.deal?.price;
        if (this.data.price) targetPlayer.set({ money: targetPlayer.money - this.data.price });

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
