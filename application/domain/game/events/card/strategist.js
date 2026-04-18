() => ({
  tutorial: {
    text: 'Заблокируй конкуренцию. Размести бустер у рулетки, положив на него жетон любой индустрии (из банка ресурсов). Теперь никто, кроме тебя, не сможет купить предприятие этой индустрии',
    showTitle: true,
    superPos: true,
  },
  init: function () {
    const { game, player, source: card } = this.eventContext();

    const eventData = { deck: {} };
    for (const deck of Object.values(game.decks)) {
      if (deck.type !== 'company') continue;
      eventData.deck[deck.id()] = { selectable: 'chip' };
    }

    eventData.controlBtn = { label: 'Помочь выбрать', resetEvent: true };
    const staticHelper = {
      text: `Необходимо выбрать тип предприятия, которое будет заблокировано`,
      buttons: null,
    };
    player.set({ eventData, staticHelper });
  },
  handlers: {
    TRIGGER({ selectedChipSubtype }) {
      const { game, player, source: card } = this.eventContext();
      const cardPlayer = card.findParent({ className: 'Player' }); // в player может быть gameMaster
      const roulette = game.roulettes.main;

      const chip = game.addNewChip(selectedChipSubtype);
      card.set({ eventData: { chipId: chip.id() } });
      card.moveToTarget(roulette.decks.buster);

      game.decks[chip.value].set({ eventData: { blockedByStrategist: { [cardPlayer.id()]: true } } });

      this.emit('RESET', { success: true });
    },
    RESET({ success = false } = {}) {
      const { game, player, source: card, beforeEventControlBtn: controlBtn } = this.eventContext();
      const roulette = game.roulettes.main;

      if (!success) {
        const chip = game.addRandomChip();
        card.set({ eventData: { ownerId: player.id(), chipId: chip.id() } });
        card.moveToTarget(roulette.decks.buster);

        game.decks[chip.value].set({ eventData: { blockedByStrategist: { [player.id()]: true } } });

        success = true;
      }

      player.set(
        { eventData: { controlBtn, deck: null }, staticHelper: null },
        { reset: ['eventData.controlBtn', 'staticHelper'] }
      );

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
