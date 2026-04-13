(function ({ chipId } = {}, initPlayer) {
  const game = this;
  const player = initPlayer || game.roundActivePlayer();
  // let player = initPlayer;
  // if (!player || player.gameMaster) player = game.getActivePlayer();

  player.initEvent({
    name: 'rouletteChipEvent',
    data: {
      rouletteChip: game.get(chipId),
      beforeEventControlBtn: lib.utils.clone(player.eventData.controlBtn),
    },
    init() {
      const { game, player } = this.eventContext();
      const eventData = { chip: {}, deck: {} };

      for (const player of game.players()) {
        for (const chip of player.getAvailableChipsByValue(this.data.rouletteChip.value)) {
          eventData.chip[chip.id()] = { selectable: true };
        }

        if (Object.keys(eventData.chip).length === 0) {
          eventData.player = {};
          for (const p of game.players().filter((p) => p !== player)) {
            if (p.getAvailableChipsByValue(this.data.rouletteChip.value).length > 0)
              eventData.player[p.id()] = { highlight: true };
          }

          if (Object.keys(eventData.player).length === 0) {
            const outer = { chip: {}, deck: {} };
            for (const company of player.decks.company.items() || []) {
              const outerDeck = company.decks.outer;
              const outerChip = outerDeck.items()[0];
              if (outerChip) outer.chip[outerChip.id()] = { selectable: true };
              else outer.deck[outerDeck.id()] = { selectable: true };
            }
            if (Object.keys(outer.chip).length > 0) Object.assign(eventData.chip, outer.chip);
            else Object.assign(eventData.deck, outer.deck);
          }
        }
      }

      eventData.chip[this.data.rouletteChip.id()] = { selectable: null };
      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({
        eventData,
        staticHelper: { text: 'Выбор действия с фишкой (разместить на предприятии или продать)' },
      });
    },
    handlers: {
      TRIGGER({ target, initPlayer: triggerPlayer }) {
        const { game, player } = this.eventContext();
        const actionPlayer = game.roundActivePlayer();

        if (target.matches?.({ className: 'Deck' })) {
          this.data.rouletteChip.moveToTarget(target, { setData: { disabled: true, eventData: { selectable: null } } });
          game.roulettes.main.set({ eventData: { roundChipId: this.data.rouletteChip.id() } });

          game.logs({
            msg: `Игрок {{player}} разместил ресурс с рулетки на предприятии <a>${target.parent().getTitle()}</a>.`,
            userId: actionPlayer.userId,
          });

          return this.emit('RESET', { success: true });
        }

        if (target.matches?.({ className: 'Chip' })) {
          const targetDeck = target.parent();
          targetDeck.removeItem(target, { forceDelete: true });

          if (this.data.rouletteChip.value === target.value) {
            const eventData = { player: {} };
            for (const player of game.players()) eventData.player[player.id()] = { selectable: true, highlight: null };

            player.set({ eventData, staticHelper: { text: 'Выбор игрока, кто получит доход' } });

            return { preventListenerRemove: true };
          } else {
            this.data.rouletteChip.moveToTarget(targetDeck, {
              setData: { disabled: true, eventData: { selectable: null } },
            });
            game.roulettes.main.set({ eventData: { roundChipId: this.data.rouletteChip.id() } });

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

          this.data.rouletteChip.parent().removeItem(this.data.rouletteChip, { forceDelete: true });

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
        const { game, player } = this.eventContext();
        const rouletteChipId = this.data.rouletteChip.id();

        const eventData = { deck: null, chip: null, player: null, controlBtn: this.data.beforeEventControlBtn };
        if (!success) eventData.chip = { [rouletteChipId]: { selectable: true } };

        player.set({ eventData, staticHelper: null }, { reset: ['eventData.controlBtn', 'eventData.chip'] });

        this.destroy();
      },
    },
  });
});
