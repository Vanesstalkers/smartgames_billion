(function ({ chipId } = {}, player) {
  const game = this;

  player.initEvent({
    name: 'useChipEvent',
    data: {
      chip: game.get(chipId),
      beforeEventControlBtn: lib.utils.clone(player.eventData.controlBtn),
    },
    init: function () {
      const { game, player } = this.eventContext();

      const eventData = { company: {}, player: {} };
      for (const company of player.decks.company.items() || []) {
        if (company.played || company.subtype !== this.data.chip.value) continue;

        eventData.company[company.id()] = { selectable: true };
      }
      for (const [companyId, { playerId }] of Object.entries(player.acquired?.company || {})) {
        const company = game.get(companyId);
        if (company.played || company.subtype !== this.data.chip.value) continue;
        eventData.player[playerId] = { selectable: true };
        eventData.company[companyId] = { selectable: true };
      }

      if (Object.keys(eventData.company).length === 0) {
        player.notifyUser('Нет доступных предприятий для выполнения действия');
        return { resetEvent: true };
      }

      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({ eventData });
    },
    handlers: {
      TRIGGER({ target }) {
        const { game, player } = this.eventContext();

        if (target) {
          this.data.target = target;

          player.set({
            staticHelper: {
              text: `Подтверждаете использование услуги '${target.getTitle()}'?`,
              buttons: [
                { text: 'Подтвердить', triggerEvent: true },
                { text: 'Отменить', resetEvent: true },
              ],
            },
          });

          return { preventListenerRemove: true };
        }
        target = this.data.target;

        this.data.chip.delete();
        target.set({ played: true });

        if (player !== target.getPlayer()) {
          player.set({ acquired: { company: { [target.id()]: null } } });
        }

        this.emit('RESET');
      },
      RESET() {
        const { game, player } = this.eventContext();

        player.set({
          staticHelper: null,
          eventData: {
            company: null,
            player: null,
            controlBtn: { ...this.data.beforeEventControlBtn, resetEvent: null },
          },
        });

        this.destroy();
      },
    },
  });
});
