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
      for (const company of player.decks.company.items() || []) {
        const outerDeck = company.decks.outer;
        if (!outerDeck.items()[0]) eventData.deck[outerDeck.id()] = { selectable: true };
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
          game.logs({ msg: `Игрок {{player}} продал ресурс за ${income}к.`, userId: actionPlayer.userId });
          actionPlayer.earnMoney(income);

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
            controlBtn: { ...this.data.beforeEventControlBtn, resetEvent: null },
          },
        });
        if (!removeRouletteChipSelectable)
          player.set({ eventData: { chip: { [rouletteChipId]: { selectable: true } } } });

        this.destroy();
      },
    },
  });
});
