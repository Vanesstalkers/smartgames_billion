(function ({ deckId } = {}, player) {
  const game = this;
  const deck = game.get(deckId);

  let text = '';
  let price = 0;
  if (deck.subtype === 'buster') {
    price = 10;
    text = 'Хотите приобрести бустер за <a>10₽</a>?';
  } else {
    price = 25;
    text = `Хотите приобрести новое предприятие за <a>${price}₽</a>?`;
  }

  player.set({
    eventData: {
      deal: { deckId, price },
    },
    staticHelper: {
      text,
      buttons: [
        { text: 'Согласиться', code: 'USE_DECK' },
        { text: 'Отказаться', code: 'DECLINE_DEAL' },
      ],
    },
  });
});
