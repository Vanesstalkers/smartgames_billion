(function ({ chipId } = {}, player) {
  const game = this;

  player.initEvent({
    name: 'useChipEvent',
    data: {
      chip: game.get(chipId),
    },
    init: function () {
      const { game, player, data: { chip } = {} } = this.eventContext();

      const eventData = { company: {}, player: {}, deck: {}, chip: {} };
      for (const player of game.players()) {
        for (const company of player.decks.company.items() || []) {
          if (company.played || company.subtype !== chip.value) continue;

          eventData.company[company.id()] = { selectable: true };
        }
        for (const [companyId, { playerId }] of Object.entries(player.acquired?.company || {})) {
          const company = game.get(companyId);
          if (company.played || company.subtype !== chip.value) continue;
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
        if (Object.keys(outer.chip).length === 0) Object.assign(eventData.deck, outer.deck);
        else Object.assign(eventData.chip, outer.chip);
      }

      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({
        eventData,
        staticHelper: {
          text: `Особые действия с фишкой${chip.ownerId ? `( владелец: ${game.get(chip.ownerId).userName})` : ''}`,
          buttons: [
            {
              text: 'Удалить',
              code: 'DELETE_CHIP',
              gameMasterAction: true,
              eventData: { chipId: chip.id() },
            },
            {
              text: 'Зарезервировать',
              code: 'RESERVE_CHIP',
              gameMasterAction: true,
              eventData: { chipId: chip.id() },
            },
          ],
        },
      });
    },
    handlers: {
      TRIGGER({ target }) {
        const { game, player, data: { chip } = {} } = this.eventContext();

        if (target) {
          if (target.matches?.({ className: 'Deck' })) {
            chip.moveToTarget(target);

            return this.emit('RESET', { success: true });
          }
          if (target.matches?.({ className: 'Chip' })) {
            const targetDeck = target.parent();
            targetDeck.removeItem(target, { forceDelete: true });

            chip.moveToTarget(targetDeck);

            return this.emit('RESET', { success: true });
          }
          if (target.matches?.({ className: 'Player' })) {
            const chipId = chip.id();
            const deckPlayerId = chip.findParent({ className: 'Player' }).id();

            if (chip.ownerId) game.get(chip.ownerId).set({ acquired: { chip: { [chipId]: null } } });
            chip.set({ ownerId: null });

            if (deckPlayerId !== target.id()) {
              target.set({ acquired: { chip: { [chipId]: { playerId: deckPlayerId } } } });
              chip.set({ ownerId: target.id() });
            }

            return this.emit('RESET', { success: true });
          }

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
        if (event) event.setHandler('SUCCESS', () => chip.delete());
      },
      RESET() {
        const { game, player, beforeEventControlBtn: controlBtn } = this.eventContext();

        player.set(
          { staticHelper: null, eventData: { company: null, player: null, deck: null, chip: null, controlBtn } },
          { reset: ['eventData.controlBtn', 'staticHelper'] }
        );

        this.destroy();
      },
    },
  });
});
