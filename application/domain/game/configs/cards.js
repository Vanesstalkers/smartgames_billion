({ apiRequest, selectGroup, template } = {}) => {
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
  ];

  const result = list
    .filter((card) => !selectGroup || card.group === selectGroup)
    .map((card) =>
      (apiRequest ? { path: `${template}/${card.group}/${card.name}.png` } : card)
    );

  return result;
};
