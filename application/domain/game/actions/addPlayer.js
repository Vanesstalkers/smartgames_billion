(function (data) {
  const game = this;
  const store = game.getStore();
  const { Player: playerClass, Card: deckItemClass, CompanyCard } = game.defaultClasses();

  const player = new playerClass(data, { parent: game });
  game.set({ playerMap: { [player._id]: {} } });

  if (data.deckMap) {
    data.deckList = [];
    for (const _id of Object.keys(data.deckMap)) data.deckList.push(store.deck[_id]);
  }
  for (const item of data.deckList || []) {
    player.addDeck(item, { deckItemClass: item.type === 'company' ? CompanyCard : deckItemClass });
  }

  game.decks.chipBank.set({ access: game.playerMap });
  
  for (const player of game.players({ readyOnly: false })) {
    player.decks.company.set({ access: game.playerMap });
  }

  return player;
});
