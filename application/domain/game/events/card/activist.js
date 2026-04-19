() => ({
  tutorial: {
    text: `Забери у игрока деньги, если у него выпал дубль, в зависимости от количества у него предприятий:\n1 предприятие - не работает\n 2 предприятия - 15₽\n 3 предприятия - 30₽\nЕсли денег не хватает - забирай, сколько есть`,
    showTitle: true,
    superPos: true,
  },
  busterAction(cardOwner) {
    const { game, player } = this.eventContext();
    const roundActivePlayer = game.roundActivePlayer();
    const companyCount = roundActivePlayer.decks.company.itemsCount();

    if (cardOwner === roundActivePlayer || companyCount < 2 || cardOwner.money <= 0) {
      player.notifyUser(
        cardOwner === roundActivePlayer
          ? 'Нельзя использовать бустер <a>ДЕЯТЕЛЬ</a> против самого себя'
          : companyCount < 2
          ? 'Бустер <a>ДЕЯТЕЛЬ</a> не работает против игроков, у которых меньше 2-х предприятий'
          : 'Бустер <a>ДЕЯТЕЛЬ</a> не работает против игроков, у которых нет денег'
      );

      this.emit('FAILED');
      return { resetEvent: true };
    }

    let money = companyCount === 2 ? 15 : 30;
    if (money > roundActivePlayer.money) money = roundActivePlayer.money;

    roundActivePlayer.set({ money: roundActivePlayer.money - money });
    cardOwner.set({ money: cardOwner.money + money });

    game.logs({
      msg: `Игрок <a>{{player}}</a> использовал бустер <a>ДЕЯТЕЛЬ</a> против игрока <a>${roundActivePlayer.getUserName()}</a> и забрал у него <a>${money}₽</a>`,
      userId: cardOwner.userId,
    });

    return { resetEvent: { success: true } };
  },
  init: function () {
    const { game, player, source: card } = this.eventContext();

    if (player.gameMaster) {
      const eventData = { player: {} };
      for (const player of game.players()) {
        eventData.player[player.id()] = { selectable: true };
      }
      player.set({ eventData, staticHelper: { text: 'Какой игрок будет использовать бустер?', buttons: null } });
      return;
    }

    return this.busterAction(card.getPlayer());
  },
  handlers: {
    TRIGGER({ target }) {
      const {
        resetEvent: { success },
      } = this.busterAction(target);
      this.emit('RESET', { success });
    },
    RESET({ success = false } = {}) {
      const { game, player, source: card } = this.eventContext();

      player.set({ eventData: { player: null }, staticHelper: null });

      if (success) card.moveToDrop();
      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
