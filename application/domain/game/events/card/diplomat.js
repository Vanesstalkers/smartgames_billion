() => ({
  tutorial: {
    text: 'Одноразовая защита от чужих бустеров: ИСКАТЕЛЬ, КРИЗИС, САБОТАЖ и ЭМБАРГО',
    showTitle: true,
    superPos: true,
  },
  init: function () {
    const { game, player } = this.eventContext();
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
