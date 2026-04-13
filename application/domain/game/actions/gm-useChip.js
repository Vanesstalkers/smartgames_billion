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

      const eventData = { company: {}, player: {}, deck: {} };
      for (const player of game.players()) {
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

        const outer = { chip: {}, deck: {} };
        for (const company of player.decks.company.items() || []) {
          const outerDeck = company.decks.outer;
          const outerChip = outerDeck.items()[0];
          if (outerChip) outer.chip[outerChip.id()] = { selectable: true };
          else outer.deck[outerDeck.id()] = { selectable: true };
        }
        if (Object.keys(outer.chip).length === 0)  Object.assign(eventData.deck, outer.deck);
      }

      if (Object.keys(eventData.company).length === 0) {
        player.notifyUser('Нет доступных предприятий для выполнения действия');
        return { resetEvent: true };
      }

      this.data.selectable.company = Object.keys(eventData.company);
      this.data.selectable.player = Object.keys(eventData.player);

      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({
        eventData,
        staticHelper: {
          text: 'Особые действия с фишкой',
          buttons: [{ text: 'Удалить фишку', code: 'DELETE_CHIP', eventData: { chipId: this.data.chip.id() } }],
        },
      });
    },
    handlers: {
      TRIGGER({ target }) {
        const { game, player } = this.eventContext();

        if (target) {

          // if (target.matches?.({ className: 'Deck' })) {

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
        if(event) event.setHandler('SUCCESS', () => this.data.chip.delete());
      },
      RESET() {
        const { game, player } = this.eventContext();

        player.set(
          {
            staticHelper: null,
            eventData: { company: null, player: null, deck: null, controlBtn: this.data.beforeEventControlBtn },
          },
          { reset: ['eventData.controlBtn', 'staticHelper'] }
        );

        this.destroy();
      },
    },
  });
});
