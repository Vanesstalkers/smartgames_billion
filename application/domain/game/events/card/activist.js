() => ({
  tutorial: {
    text: `Забери у игрока деньги, если у него выпал дубль, в зависимости от количества у него предприятий:\n1 предприятие - не работает\n 2 предприятия - 15₽\n 3 предприятия - 30₽\nЕсли денег не хватает - забирай, сколько есть`,
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
