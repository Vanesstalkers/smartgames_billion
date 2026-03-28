(class Game extends lib.game.Class() {
  constructor(...args) {
    super(...args);

    Object.assign(this, {
      ...lib.chat['@class'].decorate(),
      ...lib.game.decorators['@hasDeck'].decorate(),
      ...lib.game.decorators['@hasDicecube'].decorate(),
      ...lib.game.decorators['@hasRoulette'].decorate(),
    });

    this.defaultClasses({
      Player: domain.game._objects.Player,
      // Deck: domain.game._objects.Deck,
      // Card: domain.game._objects.Card,
    });

    this.preventSaveFields(['decks', 'dicecubes', 'roulettes']);
    this.preventBroadcastFields(['decks', 'dicecubes', 'roulettes']);
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
