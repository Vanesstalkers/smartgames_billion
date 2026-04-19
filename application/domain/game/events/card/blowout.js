() => ({
  tutorial: {
    text: 'Выбери игрока и брось чёрный кубик. Уровень шкалы дохода этого игрока уменьшится на выпавшее число. Твой уровень дохода на столько же поднимется (в пределах текущего максимума)',
    showTitle: true,
    superPos: true,
  },
  data: {
    cardOwnerId: null,
  },
  busterSelectAction() {
    const { game, player } = this.eventContext();
    const eventData = { player: {} };
    for (const player of game.players()) {
      eventData.player[player.id()] = { selectable: true };
    }
    player.set({ eventData, staticHelper: { text: 'Против какого игрока нужно использовать бустер?', buttons: null } });
  },
  init: function () {
    const { game, player } = this.eventContext();

    if (player.gameMaster) {
      const eventData = { player: {} };
      for (const player of game.players()) {
        eventData.player[player.id()] = { selectable: true };
      }
      player.set({ eventData, staticHelper: { text: 'Какой игрок будет использовать бустер?', buttons: null } });
      return;
    }

    this.data.cardOwnerId = player.id();
    this.busterSelectAction();
  },
  handlers: {
    TRIGGER({ target }) {
      const {
        game,
        player,
        data: { cardOwnerId },
      } = this.eventContext();
      const cardOwner = game.get(cardOwnerId);

      if (!cardOwner) {
        this.data.cardOwnerId = target.id();
        this.busterSelectAction();
        return { preventListenerRemove: true };
      }

      const incomeChange = game.dicecubes.black.roll().value;

      let targetIncome = target.income - incomeChange;
      if (targetIncome < 0) targetIncome = 0;
      target.set({ income: targetIncome });

      let cardOwnerIncome = cardOwner.income + incomeChange;
      const cardOwnerMaxIncome = cardOwner.maxIncome();
      if (cardOwnerIncome > cardOwnerMaxIncome) cardOwnerIncome = cardOwnerMaxIncome;
      cardOwner.set({ income: cardOwnerIncome });

      game.logs({
        msg: `Игрок <a>{{player}}</a> использовал бустер <a>ВЫБРОС</a> против игрока <a>${target.userName}</a>. На кубике выпало значение <a style="color:dimgray">${incomeChange}</a>.`,
        userId: cardOwner.userId,
      });

      this.emit('RESET', { success: true });
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
