(function ({ chipId } = {}, player) {
  const game = this;

  player.initEvent({
    name: 'useChipEvent',
    data: {
      chip: game.get(chipId),
      selectable: {
        company: [],
        player: [],
      },
      beforeEventControlBtn: lib.utils.clone(player.eventData.controlBtn),
    },
    init: function () {
      const { game, player } = this.eventContext();

      if (this.data.chip.value === 'mining') {
        if (game.isTraining()) {
          player.notifyUser({ message: 'В режиме тренировочной игры эта услуга не доступна' });
          return { resetEvent: true };
        }
        player.notifyUser({ message: 'Услуга временно недоступна' });
        return { resetEvent: true };
      }

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

      this.data.selectable.company = Object.keys(eventData.company);
      this.data.selectable.player = Object.keys(eventData.player);

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
              text: `Подтверждаете использование услуги <a>${target.getTitle()}</a>?`,
              buttons: [
                { text: 'Подтвердить', triggerEvent: true },
                { text: 'Отменить', resetEvent: true },
              ],
            },
          });

          return { preventListenerRemove: true };
        }
        target = this.data.target;

        if (player !== target.getPlayer()) {
          player.set({ acquired: { company: { [target.id()]: null } } });
        }

        this.emit('RESET');

        const event = target.play({ player });
        event.setHandler('SUCCESS', () => this.data.chip.delete());
      },
      RESET() {
        const { game, player } = this.eventContext();

        player.set({
          staticHelper: { text: null, buttons: null },
          eventData: {
            company: Object.fromEntries(this.data.selectable.company.map((companyId) => [companyId, null])),
            player: Object.fromEntries(this.data.selectable.player.map((playerId) => [playerId, null])),
            controlBtn: { ...this.data.beforeEventControlBtn, resetEvent: null },
          },
        });

        this.destroy();
      },
    },
  });
});
