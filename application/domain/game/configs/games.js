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
        deckList: [
          { type: 'company', subtype: 'light', title: 'Легкая промышленность' },
          { type: 'company', subtype: 'mining', title: 'Горнодобывающая индустрия' },
          { type: 'company', subtype: 'finance', title: 'Финансы' },
          { type: 'company', subtype: 'electronic', title: 'Электроника' },
          { type: 'company', subtype: 'media', title: 'Медиа' },
          { type: 'company', subtype: 'distribution', title: 'Дистрибуция' },
          { type: 'company', subtype: 'engineering', title: 'Машиностроение' },
          { type: 'company', subtype: 'chemistry', title: 'Химия' },
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
            deckList: [
              { _code: 'selected', subtype: 'selected', itemType: 'chip' },
              { type: 'card', subtype: 'buster' },
            ],
          },
        ],
        deckList: [
          { type: 'company', subtype: 'light', title: 'Легкая промышленность' },
          { type: 'company', subtype: 'mining', title: 'Горнодобывающая индустрия' },
          { type: 'company', subtype: 'finance', title: 'Финансы' },
          { type: 'company', subtype: 'electronic', title: 'Электроника' },
          { type: 'company', subtype: 'media', title: 'Медиа' },
          { type: 'company', subtype: 'distribution', title: 'Дистрибуция' },
          { type: 'company', subtype: 'engineering', title: 'Машиностроение' },
          { type: 'company', subtype: 'chemistry', title: 'Химия' },
          { type: 'company', subtype: 'art', title: 'Арт-индустрия' },
          { type: 'company', subtype: 'it', title: 'Информационные технологии' },
          { type: 'company', subtype: 'construction', title: 'Строительство' },
          { type: 'card', subtype: 'buster', title: 'Бустеры', hasDrop: true },
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
            { type: 'company', subtype: 'company', access: 'all' },
            { type: 'card', subtype: 'buster' },
          ],
        },
        {
          _code: 2,
          deckList: [
            { type: 'company', subtype: 'company', access: 'all' },
            { type: 'card', subtype: 'buster' },
          ],
        },
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
  //           { type: 'card', subtype: 'company' },
  //           { type: 'card', subtype: 'buster' },
  //         ],
  //       },
  //       {
  //         _code: 2,
  //         deckList: [
  //           { type: 'card', subtype: 'company' },
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
