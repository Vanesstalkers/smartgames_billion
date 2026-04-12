(class Game extends lib.game.Class() {
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

  getFreePlayerSlot() {
    const playerCount = this.players().length;
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
});
