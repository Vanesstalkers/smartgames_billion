() => ({
  tutorial: {
    text: `Забери у игрока деньги, если у него выпал дубль, в зависимости от количества у него предприятий:\n1 предприятие - не работает\n 2 предприятия - 15₽\n 3 предприятия - 30₽\nЕсли денег не хватает - забирай, сколько есть`,
    showTitle: true,
    superPos: true,
  },
  init: function () {
    const { game, player, source: card } = this.eventContext();
    const roundActivePlayer = game.roundActivePlayer();
    const companyCount = roundActivePlayer.decks.company.itemsCount();

    if (player === roundActivePlayer || companyCount < 2) {
      this.emit('FAILED');
      player.notifyUser(
        player === roundActivePlayer
          ? 'Нельзя использовать бустер <a>ДЕЯТЕЛЬ</a> против самого себя'
          : 'Бустер <a>ДЕЯТЕЛЬ</a> не работает против игроков, у которых меньше 2-х предприятий'
      );
      return { resetEvent: true };
    }

    let money = companyCount === 2 ? 15 : 30;
    if (money < roundActivePlayer.money) money = roundActivePlayer.money;

    roundActivePlayer.set({ money: roundActivePlayer.money - money });
    player.set({ money: player.money + money });
    card.moveToDrop();

    // this.emit('FAILED');
    // return { resetEvent: true };
    this.emit('RESET', { success: true });
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();
      this.emit('RESET');
    },
    RESET({ success = false } = {}) {
      const { game, player, source: card } = this.eventContext();

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
