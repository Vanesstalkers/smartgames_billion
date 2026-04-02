(function ({ chipId } = {}, initPlayer) {
  const game = this;
  const player = initPlayer || game.roundActivePlayer();

  player.initEvent({
    name: 'rouletteChipEvent',
    data: {
      rouletteChip: game.get(chipId),
    },
    init() {
      const { game, player } = this.eventContext();
      const eventData = { chip: {}, deck: {} };

      const rouletteChipValue = this.data.rouletteChip.value;
      for (const player of game.players()) {
        for (const company of player.decks.industry.items() || []) {
          const outerDeck = company.decks.outer;
          if (!outerDeck) continue;

          const outerChip = outerDeck.items()[0];
          if (outerChip) {
            if (outerChip.value === rouletteChipValue) eventData.chip[outerChip.id()] = { selectable: true };
          } else eventData.deck[outerDeck.id()] = { selectable: true };
        }

        for (const company of player.decks.industry.items() || []) {
          if (company.subtype !== rouletteChipValue) continue;

          for (const chip of company.decks.inner.items() || []) {
            if (chip.value === rouletteChipValue) eventData.chip[chip.id()] = { selectable: true };
          }
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
          this.data.rouletteChip.moveToTarget(target, { setData: { eventData: { selectable: null } } });
          game.logs({
            msg: `Игрок {{player}} разместил ресурс с рулетки на карте "${target.parent().getTitle()}".`,
            userId: actionPlayer.userId,
          });

          this.emit('RESET', { removeRouletteChipSelectable: true });
          return;
        }

        if (target.matches?.({ className: 'Chip' })) {
          const targetDeck = target.parent();
          if (!player.eventData.chip?.[target.id()]?.selectable) throw new Error('Данная фишка не может быть выбрана.');

          targetDeck.removeItem(target, { forceDelete: true });
          this.data.rouletteChip.parent().removeItem(this.data.rouletteChip, { forceDelete: true });

          const income = actionPlayer.income * 2;
          actionPlayer.set({ money: actionPlayer.money + income });
          game.logs({ msg: `Игрок {{player}} продал ресурс за ${income}к.`, userId: actionPlayer.userId });

          this.emit('RESET', { removeRouletteChipSelectable: true });
          return;
        }

        throw new Error('Некорректная цель действия.');
      },
      END_ROUND() {
        this.emit('RESET', { removeRouletteChipSelectable: true });
      },
      RESET({ removeRouletteChipSelectable = false } = {}) {
        const { game, player } = this.eventContext();
        const rouletteChipId = this.data.rouletteChip.id();
        player.set({
          eventData: {
            deck: null,
            chip: Object.fromEntries(Object.keys(player.eventData.chip).map((key) => [key, null])), // без этой логики при активном флаге removeRouletteChipSelectable не удалится chip
            controlBtn: { label: 'Завершить раунд', resetEvent: null },
          },
        });
        if (!removeRouletteChipSelectable)
          player.set({ eventData: { chip: { [rouletteChipId]: { selectable: true } } } });

        this.destroy();
      },
    },
  });
});
