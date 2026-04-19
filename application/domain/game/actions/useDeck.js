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
    buttons = [
      { text: 'Купить за <b><a>10₽</a></b>', code: 'USE_DECK' },
      { text: 'Отказаться', code: 'DECLINE_DEAL' },
    ];
  } else {
    if (player.eventData.deck?.[deckId]?.selectable) {
      // finance-card event
      player.handleEventWithTriggerListener('TRIGGER', { targetId: deckId });
      player.set({ eventData: { deal: null } });
      return;
    } else {
      price = 25;
      text = `Хотите приобрести или обменять <a>${deck.title}</a>?`;

      buttons = [
        { text: 'Купить за <b><a>25₽</a></b>', code: 'USE_DECK' },
        { text: 'Обменять за <b><a>10₽</a></b>', code: 'USE_DECK', eventData: { changeCompanyEvent: true } },
        { text: 'Отказаться', code: 'DECLINE_DEAL' },
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
