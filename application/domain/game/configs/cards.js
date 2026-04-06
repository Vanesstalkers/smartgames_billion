({ apiRequest, selectGroup, template, unique = false, ignoreBuster = true } = {}) => {
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
    
    { group: 'buster', name: 'test1', title: 'БустерТест1' },
    { group: 'buster', name: 'test2', title: 'БустерТест2' },
    { group: 'buster', name: 'test3', title: 'БустерТест3' },
    { group: 'buster', name: 'test4', title: 'БустерТест4' },
    { group: 'buster', name: 'test5', title: 'БустерТест5' },
  ];

  const result = list
    .filter((card) => !selectGroup || card.group === selectGroup)
    .filter((card) => !ignoreBuster || card.group !== 'buster')
    .filter((card, index, self) => !unique || self.findIndex((c) => c.group === card.group) === index)
    .map((card) => (apiRequest ? { path: `${template}/${card.group}/${card.name}.png` } : card));

  return result;
};
