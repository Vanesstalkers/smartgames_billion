(function ({ cardId } = {}, player) {
  const game = this;

  player.initEvent({
    name: 'useCardEvent',
    data: {
      card: game.get(cardId),
    },
    init: function () {
      const { game, player, data: { card } = {} } = this.eventContext();

      player.set({
        eventData: { label: 'Отменить действие', resetEvent: true },
        staticHelper: {
          text: `Особые действия с предприятием`,
          buttons: [
            {
              text: 'Восстановить ресурсы',
              code: 'RESTORE_CHIPS',
              gameMasterAction: true,
              eventData: { cardId: card.id() },
            },
            {
              text: 'Отменить действие',
              code: 'DO_NOTHING',
              gameMasterAction: true,
            },
          ],
        },
      });

      return { resetEvent: true };
    },
  });
});
