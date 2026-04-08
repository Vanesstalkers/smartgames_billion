() => ({
  tutorial: {
    text: 'Заблокируй конкуренцию. Размести бустер у рулетки, положив на него жетон любой индустрии (из банка ресурсов). Теперь никто, кроме тебя, не сможет купить предприятие этой индустрии',
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
