(class CompanyCard extends lib.game._objects.Card {
  constructor(data, { parent }) {
    super(data, { parent });
    Object.assign(this, lib.game.decorators['@hasDeck'].decorate());

    this.broadcastableFields(this.broadcastableFields().concat(['deckMap']));
  }

  getEvent(eventName) {
    if (!eventName) eventName = this.name;
    const event = domain.game.events?.company?.[eventName];
    if (!event) return null;
    return event();
  }

  moveToTarget(target, config = {}) {
    super.moveToTarget(target, config);

    if (this.decks?.outer) this.deleteDeck(this.decks.outer);
    if (this.decks?.inner) this.deleteDeck(this.decks.inner);

    if (config.restoreResources) this.restoreResources();
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

    const currentResourcesCount = this.decks.inner.items().length;
    for (let i = 0; i < 3 - currentResourcesCount; i++) {
      this.decks.inner.addItem({ value: this.subtype, title: resources[this.subtype].title });
    }
  }

  foreignResources() {
    return this.decks.inner
      .items()
      .filter((item) => item.ownerId)
      .concat(this.decks.outer.items().filter((item) => item.ownerId));
  }
});
