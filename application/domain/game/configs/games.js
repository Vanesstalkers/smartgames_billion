() => ({
  billion: {
    ...{ title: 'Тренажёр', icon: ['fa', 'money'] },
    items: {
      default: {
        title: 'Ручной',
        timer: 60,
      },
    },
    itemsDefault: {
      singlePlayer: true,
      timer: 60,
      cardsToRemove: [],
      autoFinishAfterRoundsOverdue: 10,

      playerList: [
        {
          _code: 1,
          active: true,
          deckList: [{ type: 'card', itemType: 'event' }],
        },
      ],
      deckList: [
        { type: 'card', itemType: 'event' },
        { type: 'card', subtype: 'active', itemType: 'event', access: 'all' },
        { type: 'card', subtype: 'drop', itemType: 'event' },
      ],
    },
  },
});
