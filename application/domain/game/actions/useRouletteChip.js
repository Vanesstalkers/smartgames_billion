(function ({ chipId } = {}, initPlayer) {
  const game = this;
  const player = initPlayer || game.roundActivePlayer();

  player.initEvent({
    name: 'rouletteChipEvent',
    data: {
      rouletteChip: game.get(chipId),
    },
    resetTargets() {
      const { game } = this.eventContext();
      for (const p of game.players()) {
        for (const company of p.decks.industry.items()) {
          company.set({ eventData: { selectable: null } });
          company.decks.outer.set({ eventData: { selectable: null } });
          company.decks.outer.items()[0]?.set({ eventData: { selectable: null } });

          for (const chip of company.decks.inner.items()) {
            chip.set({ eventData: { selectable: null } });
          }
        }
      }
    },
    init() {
      const { game, player } = this.eventContext();

      const chipValue = this.data.rouletteChip.value.split('-')[0];
      for (const player of game.players()) {
        for (const company of player.decks.industry.items() || []) {
          const outerDeck = company.decks.outer;
          if (!outerDeck) continue;

          const outerChip = outerDeck.items()[0];
          if (outerChip) outerChip.set({ eventData: { selectable: true } });
          else outerDeck.set({ eventData: { selectable: true } });
        }

        for (const company of player.decks.industry.items() || []) {
          if (company.subtype !== chipValue) continue;
          for (const chip of company.decks.inner.items() || []) {
            chip.set({ eventData: { selectable: true } });
          }
        }
      }

      player.set({ eventData: { controlBtn: { label: 'Отменить действие', resetEvent: true } } });
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

          this.resetTargets();
          this.emit('RESET');
          return;
        }

        if (target.matches?.({ className: 'Chip' })) {
          const targetDeck = target.parent();
          if (!target.eventData.selectable) throw new Error('Данная фишка не может быть выбрана.');

          targetDeck.removeItem(target, { forceDelete: true });
          this.data.rouletteChip.parent().removeItem(this.data.rouletteChip, { forceDelete: true });

          const income = actionPlayer.income * 2;
          actionPlayer.set({ money: actionPlayer.money + income });
          game.logs({ msg: `Игрок {{player}} продал ресурс за ${income}к.`, userId: actionPlayer.userId });

          this.resetTargets();
          this.emit('RESET');
          return;
        }

        throw new Error('Некорректная цель действия.');
      },
      RESET() {
        const { game, player } = this.eventContext();
        player.set({ eventData: { controlBtn: { label: 'Завершить раунд', resetEvent: null } } });

        this.resetTargets();
        this.destroy();
      },
    },
  });
});
