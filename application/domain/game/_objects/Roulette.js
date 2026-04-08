(class Roulette extends lib.game._objects.Roulette {
  
  #sectorTitles = {}

  constructor(data, { parent }) {
    super(data, { parent });
    Object.assign(this, lib.game.decorators['@hasDeck'].decorate());

    this.broadcastableFields(this.broadcastableFields().concat(['deckMap']));
  }

  spin({ toValue = null } = {}) {
    if(this.chip()) this.decks.selected.removeItem(this.chip(), { forceDelete: true });
    
    if (this.eventData?.embargoAction) this.set({ eventData: { embargoAction: null } });

    if (!this.game().isTraining()) {
      const buster = this.game().roulettes.main.decks.buster.items();
      const embargoAction = buster.find((b) => b.name === 'embargo');
      if (embargoAction) this.set({ eventData: { embargoAction: true } });
    }

    super.spin({ toValue });

    const deck = this.decks?.selected;
    deck.removeAllItems({ markDelete: true });
    deck.addItem({ value: this.value.split('-')[0] });
  }

  chip() {
    return this.find('Deck[chip_selected]Chip[]');
  }

  sectorTitle(sector, title) {
    sector = sector.split('-')[0]; // mining-1, mining-2 -> mining
    if(title) this.#sectorTitles[sector] = title;
    return this.#sectorTitles[sector] || sector;
  }
});
