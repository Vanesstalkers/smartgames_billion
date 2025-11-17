() => ({
  billion: {
    ...{ title: 'Тренажёр', icon: ['fa', 'money'] },
    items: {
      playtable: {
        title: 'Ручной',
        timer: 60,
      },
    },
    itemsDefault: {
      timer: 60,
      cardsToRemove: [],
      autoFinishAfterRoundsOverdue: 10,

      playerList: [
        {
          _code: 1,
          active: true,
          deckList: [{ type: 'card', subtype: 'industry' }, { type: 'card', subtype: 'buster' }],
        },
        {
          _code: 2,
          deckList: [{ type: 'card', subtype: 'industry' }, { type: 'card', subtype: 'buster' }],
        },
      ],
      deckList: [
        { type: 'card', subtype: 'light' },
        { type: 'card', subtype: 'mining' },
        { type: 'card', subtype: 'finance' },
        { type: 'card', subtype: 'electronic' },
        { type: 'card', subtype: 'media' },
        { type: 'card', subtype: 'distribution' },
        { type: 'card', subtype: 'art' },
        { type: 'card', subtype: 'it' },
        { type: 'card', subtype: 'engineering' },
        { type: 'card', subtype: 'chemistry' },
        { type: 'card', subtype: 'construction' },
      ],
    },
  },
});
