() => ({
  tutorial: {
    text: 'Заблокируй доход индустрии. Размести бустер у рулетки, положив на него жетон индустрии, которую блокируешь (из банка). Когда выпадет эта индустрия, сдвинь стрелку на следующий сектор по часовой (Машиностроение не действует). После этого ЭМБАРГО уходит в сброс',
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
