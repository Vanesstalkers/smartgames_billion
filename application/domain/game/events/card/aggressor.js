() => ({
  tutorial: {
    text: 'Забери у любого игрока 10₽',
    showTitle: true,
    superPos: true,
  },
  data: {
    cardOwnerId: null,
  },
  busterSelectAction() {
    const { game, player } = this.eventContext();

    const eventData = { player: {} };
    for (const player of game.players()) {
      eventData.player[player.id()] = { selectable: true };
    }
    player.set({ eventData, staticHelper: { text: 'У какого игрока нужно забрать деньги?', buttons: null } });
  },
  init: function () {
    const { game, player } = this.eventContext();

    if (player.gameMaster) {
      const eventData = { player: {} };
      for (const player of game.players()) {
        eventData.player[player.id()] = { selectable: true };
      }
      player.set({ eventData, staticHelper: { text: 'Какой игрок будет использовать бустер?', buttons: null } });
      return;
    }

    this.data.cardOwnerId = player.id();
    this.busterSelectAction();
  },
  handlers: {
    TRIGGER({ target }) {
      const {
        game,
        player,
        source: card,
        data: { cardOwnerId },
      } = this.eventContext();
      const cardOwner = game.get(cardOwnerId);

      if (!cardOwner) {
        this.data.cardOwnerId = target.id();
        this.busterSelectAction();
        return { preventListenerRemove: true };
      }

      let money = 10;
      if (money > target.money) money = target.money;
      target.set({ money: target.money - money });
      cardOwner.set({ money: cardOwner.money + money });

      game.logs(`Бустер <a>АГРЕССОР</a> использован против игрока <a>${target.getUserName()}</a>`);

      this.emit('RESET', { success: true });
    },
    RESET({ success = false } = {}) {
      const { game, player, source: card } = this.eventContext();

      player.set({ eventData: { player: null }, staticHelper: null });

      if (success) card.moveToDrop();
      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
