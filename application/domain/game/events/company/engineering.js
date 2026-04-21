() => ({
  tutorial: {
    text: 'МАШИНОСТРОЕНИЕ',
  },
  init: function () {
    const { game, player } = this.eventContext();
    const roulette = game.roulettes.main;
    const { value, sectors, sectorTitle } = roulette;

    if(!roulette.chip()) throw new Error('Использовать услугу можно только после после вращения рулетки');

    const valueIndex = sectors.indexOf(value);
    const beforeSector = sectors[(sectors.length + valueIndex - 1) % sectors.length];
    const afterSector = sectors[(sectors.length + valueIndex + 1) % sectors.length];

    player.set({
      staticHelper: {
        text: `На какой сектор повернуть рулетку?`,
        buttons: [
          { text: roulette.sectorTitle(beforeSector), triggerEvent: true, sector: beforeSector },
          { text: roulette.sectorTitle(afterSector), triggerEvent: true, sector: afterSector },
          { text: 'Отменить', resetEvent: true },
        ],
      },
    });
  },
  handlers: {
    TRIGGER({ button: { sector } }) {
      const { game, player } = this.eventContext();
      const roulette = game.roulettes.main;

      roulette.spin({ toValue: sector });
      player.set({ eventData: { chip: { [roulette.chip().id()]: { selectable: true } } } });

      this.emit('RESET', { success: true });
    },
    RESET({ success } = {}) {
      const { game, player, source: companyCard } = this.eventContext();
      const companyId = companyCard.id();

      player.set({ staticHelper: null });
      if (success && player.acquired?.company?.[companyId]) {
        player.set({ acquired: { company: { [companyId]: null } } });
      }

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
