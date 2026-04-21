() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  init: function () {
    const { game, player } = this.eventContext();

    if (game.isTraining()) {
      player.notifyUser({ message: 'В режиме тренировочной игры эта услуга не доступна' });
      return { resetEvent: true };
    }
    if(game.roulettes.main.chip()?.value !== 'mining') {
      player.notifyUser({ message: 'Услуга не активна при текущем значении рулетки' });
      return { resetEvent: true };
    }

    if (player.gameMaster) {
      const eventData = { player: {} };
      for (const player of game.players()) {
        eventData.player[player.id()] = { selectable: true };
      }
      player.set({ eventData, staticHelper: { text: 'Какой игрок будет использовать услугу?', buttons: null } });
      return;
    }

    game.decks.buster.moveRandomItems({ count: 1, target: player.decks.buster });

    return { resetEvent: { success: true } };
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();

      game.decks.buster.moveRandomItems({ count: 1, target: target.decks.buster });

      this.emit('RESET', { success: true });
    },
    RESET({ success } = {}) {
      const { game, player, source: companyCard } = this.eventContext();
      const companyId = companyCard.id();

      player.set({ eventData: { player: null }, staticHelper: null });
      if (success && player.acquired?.company?.[companyId]) {
        player.set({ acquired: { company: { [companyId]: null } } });
      }

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
