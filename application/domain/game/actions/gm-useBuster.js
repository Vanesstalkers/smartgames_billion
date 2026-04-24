(function ({ busterCardId } = {}, player) {
  const game = this;

  if (player.triggerEventEnabled()) throw new Error('Необходимо завершить предыдущее действие');

  player.initEvent({
    name: 'useBusterEvent',
    data: {
      busterCardId,
    },
    init: function () {
      const { game, player } = this.eventContext();

      const eventData = { player: {} };
      for (const player of game.players()) {
        eventData.player[player.id()] = { selectable: true };
      }

      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({ eventData, staticHelper: { text: 'Кому передать бустер?', buttons: null } });
    },
    handlers: {
      TRIGGER({ target }) {
        const {
          game,
          player,
          data: { busterCardId },
        } = this.eventContext();
        const busterCard = game.get(busterCardId);

        busterCard.moveToTarget(target.decks.buster);

        this.emit('RESET', { success: true });
      },
      RESET({ success = false } = {}) {
        const { game, player, source: card, beforeEventControlBtn: controlBtn } = this.eventContext();

        player.set(
          { eventData: { player: null, controlBtn }, staticHelper: null },
          { reset: ['eventData.controlBtn', 'staticHelper'] }
        );

        this.emit(success ? 'SUCCESS' : 'FAILED');
        this.destroy();
      },
    },
  });
});
