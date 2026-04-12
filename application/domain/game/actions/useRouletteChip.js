(function ({ chipId } = {}, initPlayer) {
  const game = this;
  const player = initPlayer || game.roundActivePlayer();

  player.initEvent({
    name: 'rouletteChipEvent',
    data: {
      rouletteChip: game.get(chipId),
      beforeEventControlBtn: lib.utils.clone(player.eventData.controlBtn),
    },
    init() {
      const { game, player } = this.eventContext();
      const eventData = { chip: {}, deck: {} };

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
          else eventData.deck = outer.deck;
        }
      }

      eventData.chip[this.data.rouletteChip.id()] = { selectable: null };
      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({ eventData });
    },
    handlers: {
      TRIGGER({ target, initPlayer: triggerPlayer }) {
        const { game, player } = this.eventContext();
        const actionPlayer = triggerPlayer || player;

        if (target.matches?.({ className: 'Deck' })) {
          this.data.rouletteChip.moveToTarget(target, { setData: { disabled: true, eventData: { selectable: null } } });
          game.roulettes.main.set({ eventData: { roundChipId: this.data.rouletteChip.id() } });

          game.logs({
            msg: `Игрок {{player}} разместил ресурс с рулетки на предприятии <a>${target.parent().getTitle()}</a>.`,
            userId: actionPlayer.userId,
          });

          this.emit('RESET', { success: true });
          return;
        }

        if (target.matches?.({ className: 'Chip' })) {
          if (target.ownerId && target.ownerId !== actionPlayer.id()) {
            throw new Error('Эта фишка принадлежит другому игроку.');
          }

          if (!player.eventData.chip?.[target.id()]?.selectable) throw new Error('Данная фишка не может быть выбрана.');

          const targetDeck = target.parent();
          targetDeck.removeItem(target, { forceDelete: true });

          if (this.data.rouletteChip.value === target.value) {
            this.data.rouletteChip.parent().removeItem(this.data.rouletteChip, { forceDelete: true });

            actionPlayer.processDistributionIncome();

            const income = actionPlayer.income * 2;
            actionPlayer.earnMoney(income);

            game.logs({ msg: `Игрок {{player}} продал ресурс за <a>${income}₽</a>.`, userId: actionPlayer.userId });
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

          this.emit('RESET', { success: true });
          return;
        }

        throw new Error('Некорректная цель действия.');
      },
      END_ROUND() {
        this.emit('RESET', { success: true });
      },
      RESET({ success = false } = {}) {
        const { game, player } = this.eventContext();
        const rouletteChipId = this.data.rouletteChip.id();
        player.set({
          eventData: {
            ...{ deck: null, chip: null, player: null },
            chip: Object.fromEntries(Object.keys(player.eventData.chip).map((key) => [key, null])), // без этой логики при активном флаге removeRouletteChipSelectable не удалится chip
            controlBtn: { ...this.data.beforeEventControlBtn, resetEvent: null },
          },
        });

        if (!success) player.set({ eventData: { chip: { [rouletteChipId]: { selectable: true } } } });

        this.destroy();
      },
    },
  });
});
