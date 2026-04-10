() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  init: function () {
    const { game, player } = this.eventContext();
    return { resetEvent: true };
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();
      return this.emit('RESET');
    },
    RESET() {
      const { game, player, source: card } = this.eventContext();

      card?.set({ played: null });
      this.destroy();
    },
  },
});
