(class CompanyCard extends lib.game._objects.Card {
  constructor(data, { parent }) {
    super(data, { parent });
    lib.game.decorators['@hasDeck'].decorate(this);

    if (data.deckMap) {
      const game = this.game();
      this.deckMap = data.deckMap;

      const { Chip, Card } = game.defaultClasses();
      for (const _id of Object.keys(data.deckMap)) {
        const deckData = game.store.deck[_id];
        const deck = this.addDeck(deckData, { deckItemClass: deckData.itemType === 'chip' ? Chip : Card });
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
    if (this.decks?.buster) this.deleteDeck(this.decks.buster);

    if (config.restoreResources) this.restoreResources();
  }

  _ensureCompanyDecks() {
    const { Chip, Card } = this.game().defaultClasses();
    if (!this.decks?.inner) {
      this.addDeck({ type: 'inner', itemType: 'chip', subtype: 'inner', itemMap: {} }, { deckItemClass: Chip });
    }
    if (!this.decks?.outer) {
      this.addDeck({ type: 'outer', itemType: 'chip', subtype: 'outer', itemMap: {} }, { deckItemClass: Chip });
    }
    if (!this.decks?.buster) {
      this.addDeck({ type: 'buster', itemType: 'card', subtype: 'buster', itemMap: {} }, { deckItemClass: Card });
    }
  }

  restoreResources() {
    this._ensureCompanyDecks();

    const player = this.getPlayer();
    const currentResourcesCount = this.decks.inner.items().length;
    const maxResourcesCount = player.getCompaniesBySubtype({ type: 'chemistry' }).length > 0 ? 4 : 3;
    for (let i = 0; i < maxResourcesCount - currentResourcesCount; i++) {
      this.decks.inner.addItem({
        value: this.subtype,
        title: this.game().resources(this.subtype).title,
      });
    }
  }
  needRestoreResources() {
    const player = this.getPlayer();
    const currentResourcesCount = this.decks.inner.items().length;
    const maxResourcesCount = player.getCompaniesBySubtype({ type: 'chemistry' }).length > 0 ? 4 : 3;
    return currentResourcesCount < maxResourcesCount;
  }

  foreignResources() {
    return this.decks.inner
      .items()
      .filter((item) => item.ownerId)
      .concat(this.decks.outer.items().filter((item) => item.ownerId));
  }

  is(subtype) {
    return this.subtype === subtype;
  }
});
