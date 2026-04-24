(async function ({ code, dealId, eventData = {} } = {}, gameMaster) {
  const game = this;
  const gameMasterId = gameMaster.id();
  const rouletteChip = game.roulettes.main.chip();

  switch (code) {
    case 'DELETE_CHIP': {
      const chipId = eventData.chipId;
      const chip = game.get(chipId);
      const player = chip.getPlayer();

      if (player?.acquired?.chip?.[chipId]) player.set({ acquired: { chip: { [chipId]: null } } });

      chip.parent().removeItem(chip, { forceDelete: true });

      game.toggleEventHandlers('RESET', {}, gameMaster);
      break;
    }
    case 'RESERVE_CHIP': {
      const eventData = { player: {} };
      for (const player of game.players()) {
        eventData.player[player.id()] = { selectable: true };
      }
      gameMaster.set({ eventData, staticHelper: { text: 'Выбор нового владельца ресурса' } });
      return;
    }
    case 'RESTORE_CHIPS': {
      game.get(eventData.cardId).restoreResources();
      game.toggleEventHandlers('RESET', {}, gameMaster);
      break;
    }
    case 'DO_NOTHING':
      break;
  }

  gameMaster.set({ staticHelper: null });
});
