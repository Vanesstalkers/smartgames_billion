(class CompanyCard extends lib.game._objects.Card {
  constructor(data, { parent }) {
    super(data, { parent });
    lib.game.decorators['@hasDeck'].decorate(this);

    if (data.deckMap) {
      const game = this.game();
      this.deckMap = data.deckMap;

      const { Chip } = game.defaultClasses();
      for (const _id of Object.keys(data.deckMap)) {
        const deckData = game.store.deck[_id];
        const deck = this.addDeck(deckData, { deckItemClass: Chip });
        deck.access = game.playerMap;
      }
    }
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

    const player = this.findParent({ className: 'Player' });
    const resources = domain.game.configs.cards({ mapFormat: true });
    const currentResourcesCount = this.decks.inner.items().length;
    const maxResourcesCount = player.companyCount({ type: 'chemistry' }) > 0 ? 4 : 3;
    for (let i = 0; i < maxResourcesCount - currentResourcesCount; i++) {
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
