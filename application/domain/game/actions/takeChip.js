(function ({ companyCardId } = {}, initPlayer) {
  const game = this;
  const player = initPlayer || game.roundActivePlayer();

  player.initEvent({
    name: 'takeChipEvent',
    data: {
      companyCardId,
    },
    init: function () {
      const { game, player } = this.eventContext();

      const eventData = { deck: {} };
      for (const deck of Object.values(game.decks)) {
        if (deck.type !== 'company') continue;
        eventData.deck[deck.id()] = { selectable: 'chip' };
      }

      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      const staticHelper = {
        text: `Необходимо выбрать ресурс для добавления на предприятие`,
        buttons: null,
      };
      player.set({ eventData, staticHelper });
    },
    handlers: {
      TRIGGER({ subtype, initPlayer: triggerPlayer }) {
        const {
          game,
          player,
          data: { companyCardId },
        } = this.eventContext();
        const companyCard = game.get(companyCardId);

        const resources = domain.game.configs.cards({ mapFormat: true });
        companyCard.decks.outer.addItem({ value: subtype, title: resources[subtype].title });

        this.emit('RESET', { success: true });
      },
      RESET({ success = false } = {}) {
        const { game, player, beforeEventControlBtn: controlBtn } = this.eventContext();

        const eventData = { controlBtn, deck: null };
        player.set({ eventData, staticHelper: null }, { reset: ['eventData.controlBtn', 'staticHelper'] });

        this.destroy();
      },
    },
  });
});
