(class CompanyCard extends lib.game._objects.Card {
  constructor(data, { parent }) {
    super(data, { parent });
    Object.assign(this, lib.game.decorators['@hasDeck'].decorate());

    this.broadcastableFields(this.broadcastableFields().concat(['deckMap']));
  }

  _ensureCompanyDecks() {
    const { Chip } = this.game().defaultClasses();
    if (!this.decks?.inner) {
      this.addDeck({ type: 'inner', itemType: 'chip', subtype: 'inner', itemMap: {} }, { deckItemClass: Chip });
    }
    if (!this.decks?.outer) {
      this.addDeck({ type: 'outer', itemType: 'chip', subtype: 'outer', itemMap: {} }, { deckItemClass: Chip });
    }
  }

  restoreResources() {
    this._ensureCompanyDecks();

    const resources = domain.game.configs
      .cards({ unique: true })
      .reduce((acc, card) => ({ ...acc, [card.group]: card }), {});

    for (let i = 0; i < 3; i++) {
      this.decks.inner.addItem({ value: this.subtype, title: resources[this.subtype].title });
    }
  }
});
