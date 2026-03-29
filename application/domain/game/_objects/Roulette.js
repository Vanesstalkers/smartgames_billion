(class Roulette extends lib.game._objects.Roulette {
  constructor(data, { parent }) {
    super(data, { parent });
    Object.assign(this, lib.game.decorators['@hasDeck'].decorate());

    this.broadcastableFields(this.broadcastableFields().concat(['deckMap']));
  }

  spin() {
    super.spin();
    const deck = this.decks?.selected;
    if (!deck) return;
    deck.removeAllItems({ markDelete: true });
    deck.addItem({ value: this.value });
  }
});
