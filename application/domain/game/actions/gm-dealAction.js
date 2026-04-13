(async function ({ code, dealId, eventData = {} } = {}, gameMaster) {
  const game = this;
  const gameMasterId = gameMaster.id();
  const rouletteChip = game.roulettes.main.chip();

  switch (code) {
    case 'DELETE_CHIP': {
      const chipId = eventData.chipId;
      const chip = game.get(chipId);
      const player = chip.findParent({ className: 'Player' });
      
      if (player?.acquired?.chip?.[chipId]) player.set({ acquired: { chip: { [chipId]: null } } });

      chip.parent().removeItem(chip, { forceDelete: true });

      game.toggleEventHandlers('RESET', {}, gameMaster);
      break;
    }
  }

  player.set({ staticHelper: null });
});
