() => ({
  tutorial: {
    text: 'Забери у любого игрока один любой ресурс',
    showTitle: true,
    superPos: true,
  },
  data: {
    selectedChipId: null,
    cardOwnerId: null,
  },
  busterSelectAction() {
    const { game, player } = this.eventContext();

    const eventData = { chip: {}, player: {} };
    for (const p of game.players()) {
      if (p === player) continue;

      for (const company of p.decks.company.items()) {
        for (const chip of [...company.decks.outer.items(), ...company.decks.inner.items()]) {
          eventData.chip[chip.id()] = { selectable: true };
          eventData.player[p.id()] = { highlight: true };
        }
      }
    }

    if (Object.keys(eventData.chip).length === 0) {
      player.notifyUser({ message: 'У игроков нет доступных ресурсов' });
      return { resetEvent: { success: false } };
    }

    player.set({ eventData, staticHelper: { text: 'Необходимо выбрать нужный ресурс', buttons: null } });
  },
  init: function () {
    const { game, player } = this.eventContext();

    if (player.gameMaster) {
      const eventData = { player: {} };
      for (const player of game.players()) {
        eventData.player[player.id()] = { selectable: true };
      }
      player.set({ eventData, staticHelper: { text: 'Какой игрок будет использовать бустер?', buttons: null } });
      return;
    }

    this.data.cardOwnerId = player.id();
    return this.busterSelectAction();
  },
  handlers: {
    TRIGGER({ target }) {
      const {
        game,
        player,
        data: { selectedChipId, cardOwnerId },
      } = this.eventContext();
      let selectedChip = game.get(selectedChipId);
      const cardOwner = game.get(cardOwnerId);

      if (!cardOwner) {
        this.data.cardOwnerId = target.id();
        this.busterSelectAction();
        return { preventListenerRemove: true };
      }

      if (!selectedChip) {
        selectedChip = target;
        this.data.selectedChipId = selectedChip.id();

        const eventData = { company: {}, deck: {}, chip: {}, player: {} };

        for (const chipId of Object.keys(player.eventData.chip)) eventData.chip[chipId] = null;
        for (const playerId of Object.keys(player.eventData.player)) eventData.player[playerId] = null;

        const maxOuterChipsCount = cardOwner.getCompaniesBySubtype({ type: 'construction' }).length > 0 ? 2 : 1;
        if (cardOwner.getOuterDecksChips().length < maxOuterChipsCount) {
          for (const company of cardOwner.decks.company.items()) {
            const outerDeck = company.decks.outer;
            const outerChip = outerDeck.items()[0];
            if (outerChip) eventData.chip[outerChip.id()] = { selectable: true };
            else eventData.deck[outerDeck.id()] = { selectable: true };
            eventData.deck[outerDeck.id()] = { selectable: 'chip' };
          }
        }

        for (const company of cardOwner.decks.company.items()) {
          if (company.played) continue;
          if (company.subtype !== selectedChip.value && company.subtype !== 'construction') continue;
          eventData.company[company.id()] = { selectable: true };
        }

        for (const [companyId, { playerId }] of Object.entries(cardOwner.acquired?.company || {})) {
          const company = game.get(companyId);
          if (company.subtype !== selectedChip.value && company.subtype !== 'construction') continue;
          eventData.player[playerId] = { highlight: true };
          eventData.company[companyId] = { selectable: true };
        }

        const rouletteChip = game.roulettes.main.chip();
        if (rouletteChip?.value === selectedChip.value) eventData.chip[rouletteChip.id()] = { selectable: true };

        if (Object.keys(eventData).length === 0) {
          player.notifyUser('Нет доступных действий для ресурса');
          this.emit('RESET');
          return;
        }

        player.set({ eventData, staticHelper: { text: 'Необходимо выбрать действие с ресурсом', buttons: null } });

        return { preventListenerRemove: true };
      } else {
        if (target.matches({ className: 'Chip' })) {
          this.emit('RESET', { success: true });

          if (target.findParent({ className: 'Roulette' })) {
            game.run('useRouletteChip', { chipId: target.id(), targetChipId: selectedChip.id() }, player);
            return;
          } else {
            const outerDeck = target.parent();
            outerDeck.removeItem(target, { forceDelete: true });
            selectedChip.moveToTarget(outerDeck);
            return;
          }
        } else if (target.matches({ className: 'Deck' })) {
          this.emit('RESET', { success: true });

          selectedChip.moveToTarget(target);
          return;
        } else if (target.matches({ className: 'CompanyCard' })) {
          this.emit('RESET', { success: true });

          const selectedChipParent = selectedChip.parent();
          const event = game.initEvent(selectedChip.value, {
            ...{ game, player, allowedPlayers: [player] },
            onSuccess: () => selectedChip.delete(),
            onFailed: () => selectedChip.moveToTarget(selectedChipParent),
          });
          if (event) {
            event.name = this.title;
            if (player) player.addEvent(event);
          }
          return;
        }
      }

      this.emit('RESET');
    },
    RESET({ success = false } = {}) {
      const { game, player, source: card } = this.eventContext();

      player.set({ eventData: { company: null, deck: null, chip: null, player: null }, staticHelper: null });

      if (success) card.moveToDrop();
      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
