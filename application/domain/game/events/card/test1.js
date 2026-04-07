() => ({
  tutorial: {
    text: 'Описание для карты тест1',
    showTitle: true,
    superPos: true,
  },
  init: function () {
    const { game, player } = this.eventContext();

    // const eventData = { chip: {}, deck: {} };

    // for (const chip of player.getAvailableChipsByValue('art')) {
    //   eventData.chip[chip.id()] = { selectable: true };
    // }
    // player.set({ eventData });

    return { resetEvent: true };
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();
      this.emit('RESET');
    },
    RESET() {
      const { game, player, source: card } = this.eventContext();
      player.set({ eventData: { chip: null, deck: null } });
      card.set({ played: null });
      this.destroy();
    },
  },
});
