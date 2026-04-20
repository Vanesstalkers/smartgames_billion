() => ({
  tutorial: {
    text: 'Замени одно своё предприятие бесплатно и без пропуска хода',
    showTitle: true,
    superPos: true,
  },
  init: function () {
    const { game, player } = this.eventContext();

    this.emit('RESET', { success: true });
    
    player.initEvent(domain.game.events.replaceCompany());
  },
  handlers: {
    RESET({ success } = {}) {
      const { game, player, source: card } = this.eventContext();

      if(success) card.moveToDrop();
      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
