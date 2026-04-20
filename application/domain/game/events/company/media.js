() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  data: {},
  init: function () {
    const { game, player, source: card } = this.eventContext();

    if (game.roundStep !== 'ROULETTE') {
      player.notifyUser('Услуга может быть предоставлена только до вращения рулетки');
      return { resetEvent: true };
    }

    const eventData = { player: {} };
    for (const player of game.players()) {
      eventData.player[player.id()] = { selectable: true };
    }

    eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
    player.set({
      eventData,
      staticHelper: { text: `Необходимо выбрать игрока для восстановления уровня дохода` },
    });
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();

      const companyCount = target.decks.company.itemsCount();
      const hasLightCompany = target.getCompaniesBySubtype({ type: 'light' }).length > 0;
      let income = 6;
      if (companyCount >= 3 || hasLightCompany) income = 10;
      else if (companyCount == 2) income = 8;

      target.updateIncome(income);

      return this.emit('RESET', { success: true });
    },
    RESET({ success } = {}) {
      const { game, player, beforeEventControlBtn: controlBtn } = this.eventContext();

      player.set(
        { eventData: { controlBtn, player: null }, staticHelper: null },
        { reset: ['eventData.controlBtn', 'staticHelper'] }
      );

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
