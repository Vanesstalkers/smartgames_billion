() => ({
  tutorial: {
    text: `Подними уровень своей шкалы дохода до текущего максимума.\n(!) только перед вращением рулетки`,
    showTitle: true,
    superPos: true,
  },
  busterAction(targetPlayer) {
    const { source: card } = this.eventContext();
    targetPlayer.updateIncome(targetPlayer.maxIncome());
  },
  init: function () {
    const { game, player } = this.eventContext();

    if (game.roundStep !== 'ROULETTE') {
      player.notifyUser('Можно использовать только перед вращением рулетки');
      return { resetEvent: { success: false } };
    }

    if (player.gameMaster) {
      const eventData = { player: {} };
      for (const player of game.players()) {
        eventData.player[player.id()] = { selectable: true };
      }
      player.set({ eventData, staticHelper: { text: 'Какой игрок будет использовать бустер?', buttons: null } });
      return;
    }
    
    this.busterAction(player);
    return { resetEvent: { success: true } };
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();
      this.busterAction(target);
      this.emit('RESET', { success: true });
    },
    RESET({ success = false } = {}) {
      const { game, player, source: card } = this.eventContext();

      player.set({ eventData: { player: null }, staticHelper: null });

      if(success) card.moveToDrop();
      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
