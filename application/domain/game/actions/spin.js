(function ({ toValue = null, player = null } = {}) {
  const game = this.game();

  if (this.chip()) this.decks.selected.removeItem(this.chip(), { forceDelete: true });

  if (this.eventData?.embargoAction) this.set({ eventData: { embargoAction: null } });

  let skipValues = [];
  const busterDeck = game.roulettes.main.decks.buster;
  if (busterDeck && !player.getCompaniesBySubtype({ type: 'engineering' }).length > 0) {
    skipValues = busterDeck
      .items()
      .filter((b) => b.name === 'embargo')
      .map((c) => game.get(c.eventData.chipId).value);
    if (skipValues.includes('mining')) skipValues.push('mining-1', 'mining-2');
  }

  let { skipped } = spin({ toValue, skipValues });

  if (skipped.length) {
    if (skipped.find((v) => v.includes('mining'))) {
      skipped = skipped.filter((v) => !v.includes('mining-'));
      skipped.push('mining');
    }
    for (const skippedValue of skipped) {
      const skippedCards = busterDeck.items().filter((b) => game.get(b.eventData.chipId).value === skippedValue);
      for (const skippedCard of skippedCards) {
        skippedCard.set({ eventData: { chipId: null } });
        skippedCard.moveToDrop();
      }
    }
    this.set({ eventData: { embargoAction: skipped.length } });
  }

  const deck = this.decks?.selected;
  deck.removeAllItems({ markDelete: true });

  const value = this.value.split('-')[0];
  const title = game.resources(value).title;
  deck.addItem({ value, title });
});
