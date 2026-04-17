(function ({ companyCardId, targetPlayerId } = {}, initPlayer) {
  const game = this;
  const player = initPlayer || game.roundActivePlayer();
  if(!targetPlayerId) targetPlayerId = player.id();

  player.initEvent({
    name: 'takeChipEvent',
    data: {
      companyCardId,
      targetPlayerId,
    },
    init: function () {
      const { game, player } = this.eventContext();

      const eventData = { deck: {} };
      for (const deck of Object.values(game.decks)) {
        if (deck.type !== 'company') continue;
        eventData.deck[deck.id()] = { selectable: 'chip' };
      }

      eventData.controlBtn = { label: 'Помочь выбрать', resetEvent: true };
      const staticHelper = {
        text: `Необходимо выбрать ресурс для добавления на предприятие`,
        buttons: null,
      };
      player.set({ eventData, staticHelper });
    },
    handlers: {
      TRIGGER({ selectedChipSubtype }) {
        const {
          game,
          player,
          data: { companyCardId },
        } = this.eventContext();
        const companyCard = game.get(companyCardId);

        this.data.selectedChipSubtype = selectedChipSubtype;
        const chip = { value: selectedChipSubtype, title: game.resources(selectedChipSubtype).title };
        companyCard.decks.outer.addItem(chip);

        this.emit('RESET', { success: true });
      },
      RESET({ success = false } = {}) {
        const {
          game,
          player,
          data: { companyCardId },
          beforeEventControlBtn: controlBtn,
        } = this.eventContext();

        if (!this.data.selectedChipSubtype) {
          const resources = Object.keys(game.resources());
          const subtype = resources[Math.floor(Math.random() * resources.length)];
          const chip = { value: subtype, title: game.resources(subtype).title };
          game.get(companyCardId).decks.outer.addItem(chip);
        }

        const eventData = { controlBtn, deck: null };
        player.set({ eventData, staticHelper: null }, { reset: ['eventData.controlBtn', 'staticHelper'] });

        this.destroy();
      },
    },
  });
});
