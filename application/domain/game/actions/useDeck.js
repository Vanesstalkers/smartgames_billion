(function ({ deckId } = {}, player) {
  const game = this;
  const deck = game.get(deckId);

  if (game.status !== 'IN_PROCESS') throw new Error('Действие доступно только после начала игры');
  if (deck.items().length === 0) throw new Error('В колоде нет доступных предприятий');

  const { blockedByStrategist: blocked } = deck.eventData;
  if (blocked && !blocked[player.id()] && !player.gameMaster) {
    const owners = Object.keys(blocked)
      .map((id) => `<a>${game.get(id).userName}</a>`)
      .join(', ');
    const ownersText = Object.keys(blocked).length > 1 ? 'владельцы' : 'владелец';
    const notifyText = `Это предприятие заблокировано бустером <a>СТРАТЕГ</a> (${ownersText}: ${owners})`;
    player.notifyUser(notifyText, { displayForced: true });
    return;
  }

  let text = '',
    buttons = [],
    price = 0;
  if (deck.subtype === 'buster') {
    price = 10;
    text = 'Хотите приобрести бустер?';

    const buyDisabled = player.money < price;
    if (buyDisabled) text += `<p style="color: red;">Для покупки недостаточно денег</p>`;
    
    buttons = [
      { text: 'Купить за <b><a>10₽</a></b>', code: 'USE_DECK', disabled: buyDisabled },
      { text: 'Отказаться', code: 'DECLINE_DEAL' },
    ];
  } else {
    if (player.eventData.deck?.[deckId]?.selectable) {
      // finance-card event
      player.handleEventWithTriggerListener('TRIGGER', { targetId: deckId });
      player.set({ eventData: { deal: null } });
      return;
    } else {
      const companiesCount = player.decks.company.items().length;
      price = companiesCount === 1 ? 25 : companiesCount === 2 ? 50 : 100;
      text = `Хотите приобрести или обменять <a>${deck.title}</a>?`;

      const buyDisabled = player.money < price;
      const exchangeDisabled = player.money < 10;

      if (buyDisabled || exchangeDisabled)
        text += `<p style="color: red;">Для покупки${exchangeDisabled ? ' или обмена' : ''} недостаточно денег</p>`;

      buttons = [
        { text: `Купить за <b><a>${price}₽</a></b>`, code: 'USE_DECK', disabled: buyDisabled },
        {
          text: 'Обменять за <b><a>10₽</a></b>',
          code: 'USE_DECK',
          eventData: { changeCompanyEvent: true },
          disabled: exchangeDisabled,
        },
        { text: 'Отказаться', code: 'DECLINE_DEAL', disabled: false },
      ];
    }
  }

  player.set({
    eventData: {
      deal: { deckId, price },
    },
    staticHelper: { text, buttons },
  });
});
