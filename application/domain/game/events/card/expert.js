() => ({
  tutorial: {
    text: 'Положи бустер рядом с одним из своих предприятий. Забирай 6₽ каждый раз у того, у кого на рулетке выпадает эта индустрия. Бустер можно переставить на другое предприятие перед вращением рулетки',
    showTitle: true,
    superPos: true,
  },
  data: {
    cardOwnerId: null,
  },
  busterSelectAction() {
    const {
      game,
      player,
      source: card,
      data: { cardOwnerId },
    } = this.eventContext();
    const cardOwner = game.get(cardOwnerId);

    const eventData = { company: {} };
    for (const company of cardOwner.decks.company.items()) {
      if (company.decks.buster.items().find((item) => item.name === card.name)) continue;
      eventData.company[company.id()] = { selectable: true };
    }

    if (Object.keys(eventData.company).length === 0) {
      player.notifyUser('Нет доступных предприятий');
      this.emit('RESET', { success: false });
      return { resetEvent: true };
    }

    player.set({ eventData, staticHelper: { text: 'К какому предприятию нужно применить бустер?', buttons: null } });
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
    return this.busterSelectAction();
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
        return this.busterSelectAction() || { preventListenerRemove: true };
      }

      card.moveToTarget(target.decks.buster);
      const deck = game.decks[target.subtype];
      const experts = deck.eventData.experts || [];
      deck.set({ eventData: { experts: experts.concat(cardOwner.id()) } });

      this.emit('RESET', { success: true });
    },
    RESET({ success = false } = {}) {
      const { game, player, source: card } = this.eventContext();

      player.set({ eventData: { company: null, player: null }, staticHelper: null });

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
