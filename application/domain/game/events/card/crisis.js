() => ({
  tutorial: {
    text: 'Устрой кризис любому игроку. При каждом его броске кубиков дохода будет -1 к результату. Отменить действие бустера КРИЗИС можно только с помощью бустера ДИПЛОМАТ.',
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
