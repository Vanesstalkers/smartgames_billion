(function ({ busterCardId } = {}, player) {
  const game = this;

  if (game.roundStep !== 'ROULETTE') {
    player.notifyUser('Можно использовать только перед вращением рулетки');
    return;
  }

  player.initEvent({
    name: 'useBusterEvent',
    data: {
      busterCardId,
    },
    init: function () {
      const { game, player } = this.eventContext();
      const busterCard = game.get(busterCardId);
      const companyCard = busterCard.findParent({ className: 'CompanyCard' });
      const cardOwner = companyCard.getPlayer();

      const eventData = { company: {} };
      for (const company of cardOwner.decks.company.items() || []) {
        if (company === companyCard) continue;
        if (company.decks.buster.items().find((item) => item.name === busterCard.name)) continue;
        eventData.company[company.id()] = { selectable: true };
      }

      if (Object.keys(eventData.company).length === 0) {
        player.notifyUser('Нет доступных предприятий для выполнения действия');
        return { resetEvent: true };
      }

      player.set({ eventData, staticHelper: { text: 'На предприятие переложить бустер?', buttons: null } });
    },
    handlers: {
      TRIGGER({ target }) {
        const busterCard = game.get(busterCardId);
        busterCard.moveToTarget(target.decks.buster);
        this.emit('RESET', { success: true });
      },
      RESET({ success = false } = {}) {
        const { game, player, source: card } = this.eventContext();

        player.set({ eventData: { company: null }, staticHelper: null });
  
        this.emit(success ? 'SUCCESS' : 'FAILED');
        this.destroy();
      },
    },
  });
});
