() => ({
  tutorial: {
    text: 'Выбери игрока и брось чёрный кубик. Уровень шкалы дохода этого игрока уменьшится на выпавшее число. Твой уровень дохода на столько же поднимется (в пределах текущего максимума)',
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
