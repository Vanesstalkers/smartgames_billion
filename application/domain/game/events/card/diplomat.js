() => ({
  tutorial: {
    text: 'Одноразовая защита от чужих бустеров: ИСКАТЕЛЬ, КРИЗИС, САБОТАЖ и ЭМБАРГО',
    showTitle: true,
    superPos: true,
  },
  init: function () {
    const { game, player } = this.eventContext();

    const eventData = { buster: {} };
    const players = player.gameMaster ? game.players() : [player];
    for (const player of players) {
      for (const card of game.roulettes.main.decks.buster.items().filter((c) => c.name == 'embargo')) {
        if (card.eventData.ownerId === player.id()) continue;
        eventData.buster[card.id()] = { selectable: true };
      }
      for (const card of player.decks.income.items().filter((c) => c.name == 'crisis')) {
        eventData.buster[card.id()] = { selectable: true };
      }
    }

    if (Object.keys(eventData.buster).length == 0) {
      player.notifyUser(`Нет целей для бустера`);
      return { resetEvent: true };
    }
    eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
    player.set({ eventData });
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();

      target.moveToDrop();

      this.emit('RESET', { success: true });
    },
    RESET({ success = false } = {}) {
      const { game, player, source: card, beforeEventControlBtn: controlBtn } = this.eventContext();

      player.set({ eventData: { buster: null, controlBtn }, staticHelper: null }, { reset: ['eventData.controlBtn'] });

      if (success) card.moveToDrop();
      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
