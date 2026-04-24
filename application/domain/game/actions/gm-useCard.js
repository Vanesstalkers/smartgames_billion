(function ({ cardId } = {}, player) {
  const game = this;

  if (player.triggerEventEnabled()) throw new Error('Необходимо завершить предыдущее действие');

  player.initEvent({
    name: 'useCardEvent',
    data: {
      cardId,
    },
    init: function () {
      const { game, player, data: { cardId } = {} } = this.eventContext();

      player.set({
        eventData: { controlBtn: { label: 'Отменить действие', resetEvent: true } },
        staticHelper: {
          text: `Особые действия с предприятием`,
          buttons: [
            {
              text: 'Восстановить ресурсы',
              code: 'RESTORE_CHIPS',
              gameMasterAction: true,
              eventData: { cardId },
            },
            // {
            //   text: 'Отменить действие',
            //   code: 'DO_NOTHING',
            //   gameMasterAction: true,
            // },
          ],
        },
      });
    },
    handlers: {
      RESET() {
        const { game, player, beforeEventControlBtn: controlBtn } = this.eventContext();
        player.set(
          { eventData: { controlBtn }, staticHelper: null },
          { reset: ['eventData.controlBtn', 'staticHelper'] }
        );
        this.destroy();
      },
    },
  });
});
