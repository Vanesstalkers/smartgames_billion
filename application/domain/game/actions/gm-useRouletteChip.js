(function ({ chipId } = {}, initPlayer) {
  const game = this;
  const player = initPlayer || game.roundActivePlayer();

  player.initEvent({
    name: 'rouletteChipEvent',
    data: {
      rouletteChipId: chipId,
    },
    init() {
      const { game, player, data: { rouletteChipId } = {} } = this.eventContext();
      const rouletteChip = game.get(rouletteChipId);
      const eventData = { chip: {}, deck: {}, player: {} };

      for (const player of game.players()) {
        for (const chip of player.getAvailableChipsByValue(rouletteChip.value)) {
          eventData.chip[chip.id()] = { selectable: true };
        }

        eventData.player = {};

        if (player.getAvailableChipsByValue(rouletteChip.value).length > 0) {
          eventData.player[player.id()] = { highlight: true };
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

      eventData.chip[rouletteChipId] = { selectable: null };
      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({
        eventData,
        staticHelper: { text: 'Выбор действия с ресурсом (разместить на предприятии или продать)' },
      });
    },
    handlers: {
      TRIGGER({ target, initPlayer: triggerPlayer }) {
        const { game, player, data: { rouletteChipId } = {} } = this.eventContext();
        const rouletteChip = game.get(rouletteChipId);
        const actionPlayer = game.roundActivePlayer();

        if (target.matches?.({ className: 'Deck' })) {
          rouletteChip.moveToTarget(target, { setData: { disabled: true, eventData: { selectable: null } } });
          game.roulettes.main.set({ eventData: { roundChipId: rouletteChipId } });

          game.logs({
            msg: `Игрок {{player}} разместил ресурс с рулетки на предприятии <a>${target.parent().getTitle()}</a>.`,
            userId: actionPlayer.userId,
          });

          return this.emit('RESET', { success: true });
        }

        if (target.matches?.({ className: 'Chip' })) {
          const targetDeck = target.parent();
          targetDeck.removeItem(target, { forceDelete: true });

          if (rouletteChip.value === target.value) {
            const eventData = { player: {} };
            for (const player of game.players()) eventData.player[player.id()] = { selectable: true, highlight: null };

            player.set({ eventData, staticHelper: { text: 'Выбор игрока, кто получит доход' } });

            return { preventListenerRemove: true };
          } else {
            rouletteChip.moveToTarget(targetDeck, {
              setData: { disabled: true, eventData: { selectable: null } },
            });
            game.roulettes.main.set({ eventData: { roundChipId: rouletteChipId } });

            game.logs({
              msg: `Игрок {{player}} разместил ресурс с рулетки на предприятии <a>${targetDeck
                .parent()
                .getTitle()}</a>.`,
              userId: actionPlayer.userId,
            });
          }

          return this.emit('RESET', { success: true });
        }

        if (target.matches?.({ className: 'Player' })) {
          const actionPlayer = target;

          rouletteChip.parent().removeItem(rouletteChip, { forceDelete: true });

          actionPlayer.processDistributionIncome();

          const income = actionPlayer.income * 2;
          actionPlayer.earnMoney(income);

          game.logs({ msg: `Игрок {{player}} продал ресурс за <a>${income}₽</a>.`, userId: actionPlayer.userId });

          return this.emit('RESET', { success: true });
        }

        throw new Error('Некорректная цель действия.');
      },
      END_ROUND() {
        this.emit('RESET', { success: true });
      },
      RESET({ success = false } = {}) {
        const { game, player, data: { rouletteChipId } = {}, beforeEventControlBtn: controlBtn } = this.eventContext();

        const eventData = { controlBtn, deck: null, chip: null, player: null };
        if (!success) eventData.chip = { [rouletteChipId]: { selectable: true } };

        player.set({ eventData, staticHelper: null }, { reset: ['eventData.controlBtn', 'eventData.chip'] });

        this.destroy();
      },
    },
  });
});
