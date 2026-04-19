() => ({
  tutorial: {
    text: 'Скинь этот бустер и возьми два новых, сразу в этот ход',
    showTitle: true,
    superPos: true,
  },
  busterAction(targetPlayer) {
    const { game, player, source: card } = this.eventContext();
    game.decks.buster.moveRandomItems({ count: 2, target: targetPlayer.decks.buster });
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

    this.busterAction(player);

    return { resetEvent: { success: true } };
  },
  handlers: {
    TRIGGER({ target }) {
      this.busterAction(target);
      this.emit('RESET', { success: true });
    },
    RESET({ success } = {}) {
      const { game, player, source: card } = this.eventContext();

      player.set({ eventData: { player: null }, staticHelper: null });

      if (success) card.moveToDrop();
      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
