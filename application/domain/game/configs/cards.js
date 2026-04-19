({ apiRequest, selectGroup, template, unique = false, mapFormat = false, ignoreBuster = true } = {}) => {
  const list = [
    { group: 'light', name: 'light', title: 'Легкая промышленность' },
    { group: 'light', name: 'light', title: 'Легкая промышленность' },
    { group: 'light', name: 'light', title: 'Легкая промышленность' },
    { group: 'mining', name: 'mining', title: 'Горнодобывающая индустрия' },
    { group: 'mining', name: 'mining', title: 'Горнодобывающая индустрия' },
    { group: 'mining', name: 'mining', title: 'Горнодобывающая индустрия' },
    { group: 'finance', name: 'finance', title: 'Финансы' },
    { group: 'finance', name: 'finance', title: 'Финансы' },
    { group: 'finance', name: 'finance', title: 'Финансы' },
    { group: 'electronic', name: 'electronic', title: 'Электроника' },
    { group: 'electronic', name: 'electronic', title: 'Электроника' },
    { group: 'electronic', name: 'electronic', title: 'Электроника' },
    { group: 'media', name: 'media', title: 'Медиа' },
    { group: 'media', name: 'media', title: 'Медиа' },
    { group: 'media', name: 'media', title: 'Медиа' },
    { group: 'distribution', name: 'distribution', title: 'Дистрибуция' },
    { group: 'distribution', name: 'distribution', title: 'Дистрибуция' },
    { group: 'distribution', name: 'distribution', title: 'Дистрибуция' },
    { group: 'art', name: 'art', title: 'Арт-индустрия' },
    { group: 'art', name: 'art', title: 'Арт-индустрия' },
    { group: 'art', name: 'art', title: 'Арт-индустрия' },
    { group: 'it', name: 'it', title: 'Информационные технологии' },
    { group: 'it', name: 'it', title: 'Информационные технологии' },
    { group: 'it', name: 'it', title: 'Информационные технологии' },
    { group: 'engineering', name: 'engineering', title: 'Машиностроение' },
    { group: 'engineering', name: 'engineering', title: 'Машиностроение' },
    { group: 'engineering', name: 'engineering', title: 'Машиностроение' },
    { group: 'chemistry', name: 'chemistry', title: 'Химия' },
    { group: 'chemistry', name: 'chemistry', title: 'Химия' },
    { group: 'chemistry', name: 'chemistry', title: 'Химия' },
    { group: 'construction', name: 'construction', title: 'Строительство' },
    { group: 'construction', name: 'construction', title: 'Строительство' },
    { group: 'construction', name: 'construction', title: 'Строительство' },

    // { group: 'buster', name: 'strategist', title: 'СТРАТЕГ' }, // +
    // { group: 'buster', name: 'strategist', title: 'СТРАТЕГ' }, // +
    // { group: 'buster', name: 'diplomat', title: 'ДИПЛОМАТ' },
    // { group: 'buster', name: 'diplomat', title: 'ДИПЛОМАТ' },
    // { group: 'buster', name: 'diplomat', title: 'ДИПЛОМАТ' },
    // { group: 'buster', name: 'winner', title: 'ВЫИГРЫВАТЕЛЬ' },
    // { group: 'buster', name: 'winner', title: 'ВЫИГРЫВАТЕЛЬ' },
    // { group: 'buster', name: 'solver', title: 'РЕШАТЕЛЬ' },
    // { group: 'buster', name: 'solver', title: 'РЕШАТЕЛЬ' },
    // { group: 'buster', name: 'crisis', title: 'КРИЗИС' },
    // { group: 'buster', name: 'crisis', title: 'КРИЗИС' },
    // { group: 'buster', name: 'sabotage', title: 'САБОТАЖ' },
    // { group: 'buster', name: 'sabotage', title: 'САБОТАЖ' },
    { group: 'buster', name: 'activist', title: 'ДЕЯТЕЛЬ' }, // +
    { group: 'buster', name: 'activist', title: 'ДЕЯТЕЛЬ' }, // +
    { group: 'buster', name: 'activist', title: 'ДЕЯТЕЛЬ' }, // +
    { group: 'buster', name: 'activist', title: 'ДЕЯТЕЛЬ' }, // +
    // { group: 'buster', name: 'alchemist', title: 'АЛХИМИК' },
    // { group: 'buster', name: 'alchemist', title: 'АЛХИМИК' },
    // { group: 'buster', name: 'embargo', title: 'ЭМБАРГО' }, // +
    // { group: 'buster', name: 'embargo', title: 'ЭМБАРГО' }, // +
    // { group: 'buster', name: 'embargo', title: 'ЭМБАРГО' }, // +
    // { group: 'buster', name: 'blowout', title: 'ВЫБРОС' }, // +
    // { group: 'buster', name: 'blowout', title: 'ВЫБРОС' }, // +
    // { group: 'buster', name: 'blowout', title: 'ВЫБРОС' }, // +
    // { group: 'buster', name: 'achiever', title: 'ДОСТИГАТОР' }, // +
    // { group: 'buster', name: 'achiever', title: 'ДОСТИГАТОР' }, // +
    // { group: 'buster', name: 'aggressor', title: 'АГРЕССОР' }, // +
    // { group: 'buster', name: 'aggressor', title: 'АГРЕССОР' }, // +
    // { group: 'buster', name: 'innovator', title: 'ИННОВАТОР' },
    // { group: 'buster', name: 'innovator', title: 'ИННОВАТОР' },
    // { group: 'buster', name: 'seeker', title: 'ИСКАТЕЛЬ' },
    // { group: 'buster', name: 'seeker', title: 'ИСКАТЕЛЬ' },
    // { group: 'buster', name: 'seeker', title: 'ИСКАТЕЛЬ' },
    // { group: 'buster', name: 'expert', title: 'ЭКСПЕРТ' },
    // { group: 'buster', name: 'expert', title: 'ЭКСПЕРТ' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
    // { group: 'buster', name: 'trainer', title: 'ТРЕНЕР' },
  ];

  const result = list
    .filter(
      (card) =>
        !selectGroup ||
        (selectGroup === 'company' && card.group !== 'buster') ||
        (selectGroup === 'buster' && card.group === 'buster')
    )
    .filter((card) => !ignoreBuster || selectGroup === 'buster' || card.group !== 'buster')
    .filter(
      (card, index, self) => !unique || self.findIndex((c) => c.group === card.group && c.name === card.name) === index
    )
    .map((card) => (apiRequest ? { path: `${template}/${selectGroup}/${card.name}.png` } : card));

  return mapFormat ? result.reduce((acc, card) => ({ ...acc, [card.group]: card }), {}) : result;
};
