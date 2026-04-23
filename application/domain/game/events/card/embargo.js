() => ({
  tutorial: {
    text: 'Заблокируй доход индустрии. Размести бустер у рулетки, положив на него жетон индустрии, которую блокируешь (из банка). Когда выпадет эта индустрия, сдвинь стрелку на следующий сектор по часовой (Машиностроение не действует). После этого ЭМБАРГО уходит в сброс',
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
      text: `Необходимо выбрать тип индустрии, доход которой будет заблокирован`,
      buttons: null,
    };
    player.set({ eventData, staticHelper });
  },
  handlers: {
    TRIGGER({ selectedChipSubtype }) {
      const { game, player, source: card } = this.eventContext();
      const cardPlayer = card.getPlayer(); // в player может быть gameMaster
      const roulette = game.roulettes.main;

      const chip = game.addNewChip(selectedChipSubtype);
      card.set({ eventData: { ownerId: cardPlayer.id(), chipId: chip.id() } });
      card.moveToTarget(roulette.decks.buster);

      this.emit('RESET', { success: true });
    },
    RESET({ success = false } = {}) {
      const { game, player, source: card, beforeEventControlBtn: controlBtn } = this.eventContext();
      const roulette = game.roulettes.main;

      if (!success) {
        const chip = game.addRandomChip();
        card.set({ eventData: { ownerId: player.id(), chipId: chip.id() } });
        card.moveToTarget(roulette.decks.buster);

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
