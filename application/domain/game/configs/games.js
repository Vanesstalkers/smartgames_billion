() => ({
  trainer: {
    ...{ title: 'Тренажер', icon: ['fa', 'desktop'] },
    items: {
      training: {
        title: 'Тренировочная игра',
        timer: 60,
        rouletteList: [
          {
            _code: 'main',
            subtype: 'main',
            sectors: [
              ...['light', 'mining-1', 'finance', 'media', 'engineering'],
              ...['electronic', 'mining-2', 'distribution', 'chemistry'],
            ],
            deckList: [{ _code: 'selected', subtype: 'selected', itemType: 'chip' }],
          },
        ],
      },
      main: {
        title: 'Основная игра',
        timer: 60,
        rouletteList: [
          {
            _code: 'main',
            subtype: 'main',
            sectors: [
              ...['electronic', 'construction', 'mining-1', 'distribution'],
              ...['it', 'engineering', 'light', 'chemistry', 'mining-2'],
              ...['finance', 'media', 'art'],
            ],
            deckList: [{ _code: 'selected', subtype: 'selected', itemType: 'chip' }],
          },
        ],
      },
    },
    itemsDefault: {
      timer: 60,
      cardsToRemove: [],
      autoFinishAfterRoundsOverdue: 10,
      playerStartMoney: 6,
      playerList: [
        {
          _code: 1,
          active: true,
          deckList: [
            { type: 'company', subtype: 'industry', access: 'all' },
            { type: 'card', subtype: 'buster' },
          ],
        },
        {
          _code: 2,
          deckList: [
            { type: 'company', subtype: 'industry', access: 'all' },
            { type: 'card', subtype: 'buster' },
          ],
        },
      ],
      deckList: [
        { type: 'card', subtype: 'buster' },
        { type: 'company', subtype: 'light' },
        { type: 'company', subtype: 'mining' },
        { type: 'company', subtype: 'finance' },
        { type: 'company', subtype: 'electronic' },
        { type: 'company', subtype: 'media' },
        { type: 'company', subtype: 'distribution' },
        { type: 'company', subtype: 'art' },
        { type: 'company', subtype: 'it' },
        { type: 'company', subtype: 'engineering' },
        { type: 'company', subtype: 'chemistry' },
        { type: 'company', subtype: 'construction' },
      ],
      dicecubeList: [
        { _code: 'white', subtype: 'white' },
        { _code: 'black', subtype: 'black' },
      ],
      rouletteList: [
        {
          _code: 'main',
          subtype: 'main',
          deckList: [{ _code: 'selected', subtype: 'selected' }],
        },
      ],
    },
  },
  // trainer: {
  //   disabled: true,
  //   ...{ title: 'Тренажёр', icon: ['fa', 'retweet'] },
  //   items: {
  //     default: {
  //       title: 'Обычный',
  //       timer: 60,
  //     },
  //   },
  //   itemsDefault: {
  //     timer: 60,
  //     cardsToRemove: [],
  //     autoFinishAfterRoundsOverdue: 10,

  //     playerList: [
  //       {
  //         _code: 1,
  //         active: true,
  //         deckList: [
  //           { type: 'card', subtype: 'industry' },
  //           { type: 'card', subtype: 'buster' },
  //         ],
  //       },
  //       {
  //         _code: 2,
  //         deckList: [
  //           { type: 'card', subtype: 'industry' },
  //           { type: 'card', subtype: 'buster' },
  //         ],
  //       },
  //     ],
  //     deckList: [
  //       { type: 'card', subtype: 'light' },
  //       { type: 'card', subtype: 'mining' },
  //       { type: 'card', subtype: 'finance' },
  //       { type: 'card', subtype: 'electronic' },
  //       { type: 'card', subtype: 'media' },
  //       { type: 'card', subtype: 'distribution' },
  //       { type: 'card', subtype: 'art' },
  //       { type: 'card', subtype: 'it' },
  //       { type: 'card', subtype: 'engineering' },
  //       { type: 'card', subtype: 'chemistry' },
  //       { type: 'card', subtype: 'construction' },
  //     ],
  //   },
  // },
});
