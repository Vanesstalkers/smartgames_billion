(function ({ chipId } = {}, player) {
  const game = this;

  player.initEvent({
    name: 'useChipEvent',
    data: {
      chip: game.get(chipId),
    },
    init: function () {
      const { game, player } = this.eventContext();

      const eventData = { company: {}, player: {} };
      for (const company of player.decks.industry.items() || []) {
        if (company.used || company.subtype !== this.data.chip.value) continue;

        eventData.company[company.id()] = { selectable: true };
      }
      for (const [companyId, { sellerId }] of Object.entries(player.acquired.company)) {
        const company = game.get(companyId);
        if (company.played) continue;
        eventData.player[sellerId] = { selectable: true };
        eventData.company[companyId] = { selectable: true };
      }

      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({ eventData });
    },
    handlers: {
      TRIGGER({ target }) {
        const { game, player } = this.eventContext();

        this.data.chip.delete();
        target.set({ played: true });

        this.emit('RESET');
      },
      RESET() {
        const { game, player } = this.eventContext();

        player.set({
          eventData: { company: null, player: null, controlBtn: { label: 'Завершить раунд', resetEvent: null } },
        });

        this.destroy();
      },
    },
  });
});
