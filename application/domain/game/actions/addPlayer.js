(function (data) {
  const store = this.getStore();
  const { Player: playerClass, Card: deckItemClass, CompanyCard } = this.defaultClasses();
  const player = new playerClass(data, { parent: this });
  this.set({ playerMap: { [player._id]: {} } });

  if (data.deckMap) {
    data.deckList = [];
    for (const _id of Object.keys(data.deckMap)) data.deckList.push(store.deck[_id]);
  }
  for (const item of data.deckList || []) {
    if (item.access !== 'all') item.access = { [player._id]: {} };
    player.addDeck(item, { deckItemClass: item.type === 'company' ? CompanyCard : deckItemClass });
  }

  return player;
});
