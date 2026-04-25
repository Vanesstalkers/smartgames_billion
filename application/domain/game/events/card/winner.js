() => ({
  tutorial: {
    text: 'Возьми из банка 20₽',
    showTitle: true,
    superPos: true,
  },
  busterAction(targetPlayer) {   
    targetPlayer.earnMoney(20);
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

      player.set({ eventData: { player: null } });

      if (success) card.moveToDrop();
      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
