(function ({ chipId, selectedChipSubtype } = {}, player) {
  const game = this;

  if (selectedChipSubtype) {
    return player.handleEventWithTriggerListener('TRIGGER', { selectedChipSubtype });
  }

  player.initEvent({
    name: 'useChipEvent',
    data: {
      chipId,
    },
    init: function () {
      const { game, player, data: { chipId } = {} } = this.eventContext();
      const chip = game.get(chipId);

      const eventData = { company: {}, player: {}, deck: {}, chip: {} };
      for (const player of game.players()) {
        for (const company of player.decks.company.items() || []) {
          if (!company.is('construction') && (company.played || company.subtype !== chip.value)) continue;

          eventData.company[company.id()] = { selectable: true };
        }
        for (const [companyId, { playerId }] of Object.entries(player.acquired?.company || {})) {
          const company = game.get(companyId);
          if (company.played || company.subtype !== chip.value) continue;
          eventData.player[playerId] = { selectable: true };
          eventData.company[companyId] = { selectable: true };
        }

        const outer = { chip: {}, deck: {} };
        let hasConstruction = false;
        for (const company of player.decks.company.items() || []) {
          if (company.is('construction')) hasConstruction = true;
          const outerDeck = company.decks.outer;
          const outerChip = outerDeck.items()[0];
          if (outerChip) outer.chip[outerChip.id()] = { selectable: true };
          else outer.deck[outerDeck.id()] = { selectable: true };
        }
        if (hasConstruction) {
          if (Object.keys(outer.chip).length > 1) Object.assign(eventData.chip, outer.chip);
          else {
            Object.assign(eventData.deck, outer.deck);
            Object.assign(eventData.chip, outer.chip);
          }
        } else {
          if (Object.keys(outer.chip).length > 0) Object.assign(eventData.chip, outer.chip);
          else Object.assign(eventData.deck, outer.deck);
        }
      }

      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({
        eventData,
        staticHelper: {
          text: `Особые действия с ресурсом${chip.ownerId ? `( владелец: ${game.get(chip.ownerId).userName})` : ''}`,
          buttons: [
            {
              text: 'Удалить',
              code: 'DELETE_CHIP',
              gameMasterAction: true,
              eventData: { chipId },
            },
            {
              text: 'Зарезервировать',
              code: 'RESERVE_CHIP',
              gameMasterAction: true,
              eventData: { chipId },
            },
          ],
        },
      });
    },
    handlers: {
      TRIGGER({ target }) {
        const { game, player, data: { chipId } = {} } = this.eventContext();
        const chip = game.get(chipId);

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
            const deckPlayerId = chip.getPlayer().id();

            if (chip.ownerId) game.get(chip.ownerId).set({ acquired: { chip: { [chipId]: null } } });
            chip.set({ ownerId: null });

            if (deckPlayerId !== target.id()) {
              target.set({ acquired: { chip: { [chipId]: { playerId: deckPlayerId } } } });
              chip.set({ ownerId: target.id() });
            }

            return this.emit('RESET', { success: true });
          }

          this.data.targetId = target.id();
          
          player.set({
            eventData: { company: null, player: null, deck: null, chip: null },
            staticHelper: {
              text: `Подтверждаете использование услуги <a>${chip.title}</a>?`,
              buttons: [
                { text: 'Подтвердить', triggerEvent: true },
                { text: 'Отменить', resetEvent: true },
              ],
            },
          });

          return { preventListenerRemove: true };
        }
        target = game.get(this.data.targetId);

        if (player !== target.getPlayer()) {
          player.set({ acquired: { company: { [target.id()]: null } } });
        }

        this.emit('RESET');

        if (target.is('construction')) {
          if (!domain.game.events?.company?.[chip.value]) {
            player.notifyUser(`Событие предприятия <a>${chip.title}</a> не найдено`, { displayForced: true });
            return;
          }

          const event = target.initEvent(chip.value, {
            ...{ game, player, allowedPlayers: [player] },
            onSuccess: () => chip.delete(),
          });

          if (event) {
            event.name = this.title;
            if (player) player.addEvent(event);
          }
        } else target.play({ player, onSuccess: () => chip.delete() });
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
