(function ({ chipId } = {}, initPlayer) {
  const game = this;
  const player = initPlayer || game.roundActivePlayer();

  player.initEvent({
    name: 'rouletteChipEvent',
    data: {
      rouletteChipId,
    },
    init() {
      const { game, player, data: { rouletteChipId } = {} } = this.eventContext();
      const rouletteChip = game.get(rouletteChipId);
      const eventData = { chip: {}, deck: {} };

      for (const chip of player.getAvailableChipsByValue(rouletteChip.value)) {
        eventData.chip[chip.id()] = { selectable: true };
      }

      if (Object.keys(eventData.chip).length === 0) {
        eventData.player = {};
        for (const p of game.players().filter((p) => p !== player)) {
          if (p.getAvailableChipsByValue(rouletteChip.value).length > 0)
            eventData.player[p.id()] = { highlight: true };
        }

        if (Object.keys(eventData.player).length === 0) {
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
              eventData.deck = outer.deck;
              Object.assign(eventData.chip, outer.chip);
            }
          } else {
            if (Object.keys(outer.chip).length > 0) Object.assign(eventData.chip, outer.chip);
            else eventData.deck = outer.deck;
          }
        }
      }

      eventData.chip[rouletteChipId] = { selectable: null };
      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({ eventData });
    },
    handlers: {
      TRIGGER({ target, initPlayer: triggerPlayer }) {
        const { game, player, data: { rouletteChipId } = {} } = this.eventContext();
        const rouletteChip = game.get(rouletteChipId);
        const actionPlayer = triggerPlayer || player;

        if (target.matches?.({ className: 'Deck' })) {
          rouletteChip.moveToTarget(target, { setData: { disabled: true, eventData: { selectable: null } } });
          game.roulettes.main.set({ eventData: { roundChipId: rouletteChipId } });

          game.logs({
            msg: `Игрок {{player}} разместил ресурс с рулетки на предприятии <a>${target.parent().getTitle()}</a>.`,
            userId: actionPlayer.userId,
          });

          this.emit('RESET', { success: true });
          return;
        }

        if (target.matches?.({ className: 'Chip' })) {
          if (target.ownerId && target.ownerId !== actionPlayer.id()) {
            throw new Error('Этот ресурс принадлежит другому игроку.');
          }

          if (!player.eventData.chip?.[target.id()]?.selectable) throw new Error('Данный ресурс не может быть выбран.');

          const targetDeck = target.parent();
          targetDeck.removeItem(target, { forceDelete: true });

          if (rouletteChip.value === target.value) {
            rouletteChip.parent().removeItem(rouletteChip, { forceDelete: true });

            actionPlayer.processDistributionIncome();

            const income = actionPlayer.income * 2;
            actionPlayer.earnMoney(income);

            game.logs({ msg: `Игрок {{player}} продал ресурс за <a>${income}₽</a>.`, userId: actionPlayer.userId });
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

          this.emit('RESET', { success: true });
          return;
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

        player.set({ eventData }, { reset: ['eventData.controlBtn', 'eventData.chip'] });

        this.destroy();
      },
    },
  });
});
