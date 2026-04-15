() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  init: function () {
    const { game, player } = this.eventContext();

    if (player.gameMaster) {
      const eventData = { player: {} };
      for (const player of game.players()) {
        eventData.player[player.id()] = { selectable: true };
      }
      player.set({ eventData, staticHelper: { text: 'Какой игрок будет использовать услугу?', buttons: null } });
      return;
    }

    game.decks.buster.moveRandomItems({ count: 1, target: player.decks.buster });
    
    this.emit('SUCCESS');
    return { resetEvent: true };
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();

      game.decks.buster.moveRandomItems({ count: 1, target: target.decks.buster });

      this.emit('RESET', { success: true });
    },
    RESET({ success } = {}) {
      const { game, player } = this.eventContext();

      player.set({ eventData: { player: null }, staticHelper: null });

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
