(class Game extends lib.game.Class() {
  #resources = domain.game.configs.cards({ mapFormat: true });
  #busters = domain.game.configs.cards({ selectGroup: 'buster', unique: true }).reduce((agg, c)=>({...agg, [c.name]: {title: c.title}}), {});

  constructor(...args) {
    super(...args);

    lib.chat['@class'].decorate(this);
    lib.game.decorators['@hasDeck'].decorate(this);
    lib.game.decorators['@hasDicecube'].decorate(this);
    lib.game.decorators['@hasRoulette'].decorate(this);

    this.defaultClasses({
      Player: domain.game._objects.Player,
      Roulette: domain.game._objects.Roulette,
      CompanyCard: domain.game._objects.CompanyCard,
      // Deck: domain.game._objects.Deck,
      // Card: domain.game._objects.Card,
    });
  }

  resources(type) {
    if (!type) return this.#resources;
    return this.#resources[type];
  }

  busters(name) {
    if (!name) return this.#busters;
    return this.#busters[name];
  }

  getFreePlayerSlot() {
    const playerCount = this.players({ readyOnly: false }).length;
    if (this.maxPlayersInGame && playerCount >= this.maxPlayersInGame) return null;

    const player = this.run('addPlayer', {
      ...lib.utils.structuredClone(this.settings.playerTemplates['default']),
      _code: playerCount + 1,
    });

    return player;
  }

  isTraining() {
    return this.gameConfig === 'training';
  }

  stepLabel(label) {
    return `Раунд ${this.round} (${label})`;
  }

  getEvent(eventName) {
    if (!eventName) eventName = this.name;
    const event = domain.game.events?.company?.[eventName] || domain.game.events?.[eventName];
    if (!event) return null;
    return event();
  }

  removeTableCards() {
    const tableDecks = this.select({ className: 'Deck', attr: { placement: 'table' } });
    for (const deck of tableDecks) {
      deck.moveAllItems({ toDrop: true, setData: { visible: false } });
    }
  }

  restorePlayersHands() {
    const { roundStepWinner } = this.rounds[this.round];
    for (const player of this.players()) {
      if (player === roundStepWinner) continue; // карты победителя сбрасываются
      player.returnTableCardsToHand();
    }
  }

  addNewChip(subtype) {
    const chip = { value: subtype, title: this.resources(subtype).title };
    return this.decks.chipBank.addItem(chip);
  }
  addRandomChip() {
    const resources = Object.keys(this.resources());
    const subtype = resources[Math.floor(Math.random() * resources.length)];
    return this.addNewChip(subtype);
  }
});
