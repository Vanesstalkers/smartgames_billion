() => ({
  tutorial: {
    text: 'Положи бустер рядом с одним из своих предприятий. Забирай 6₽ каждый раз у того, у кого на рулетке выпадает эта индустрия. Бустер можно переставить на другое предприятие перед вращением рулетки',
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
