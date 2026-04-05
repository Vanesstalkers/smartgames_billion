() => ({
  tutorial: {
    // text: 'Игрок делает еще один ход вне очереди',
  },
  init: function () {
    const { game, player } = this.eventContext();

    const eventData = { chip: {}, deck: {} };

    for (const chip of player.getAvailableChipsByValue('art')) {
      eventData.chip[chip.id()] = { selectable: true };
    }
    player.set({ eventData });
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
