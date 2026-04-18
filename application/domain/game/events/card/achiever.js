() => ({
  tutorial: {
    text: 'Скинь этот бустер и возьми два новых, сразу в этот ход',
    showTitle: true,
    superPos: true,
  },
  init: function () {
    const { game, player, source: card } = this.eventContext();
    this.emit('FAILED');
    return { resetEvent: true };
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();
      this.emit('RESET');
    },
    RESET() {
      const { game, player, source: card } = this.eventContext();
      this.destroy();
    },
  },
});
