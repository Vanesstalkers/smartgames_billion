() => ({
  tutorial: {
    text: 'Положи бустер рядом со своей шкалой дохода. При каждом твоём броске кубиков дохода будет +1 к результату',
    showTitle: true,
    superPos: true,
  },
  busterAction(targetPlayer) {
    const { source: card } = this.eventContext();
    card.moveToTarget(targetPlayer.decks.income);
  },
  init: function () {
    const { game, player, source: card } = this.eventContext();

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
    RESET({ success = false } = {}) {
      const { game, player, source: card } = this.eventContext();

      player.set({ eventData: { player: null }, staticHelper: null });

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
