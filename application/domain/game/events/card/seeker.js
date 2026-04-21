() => ({
  tutorial: {
    text: 'Забери у любого игрока один любой ресурс',
    showTitle: true,
    superPos: true,
  },
  data: {
    selectedChipId: null,
    cardOwnerId: null,
    targetPlayerId: null,
  },
  selectTargetPlayerAction() {
    const { game, player } = this.eventContext();

    const eventData = { player: {} };
    for (const p of game.players()) {
      if (p === player && !player.gameMaster) continue;
      eventData.player[p.id()] = { selectable: true };
    }

    player.set({
      eventData,
      staticHelper: { text: 'Выберите игрока, у которого нужно забрать ресурс', buttons: null },
    });
  },
  busterSelectAction() {
    const { game, player, data: { targetPlayerId } = {} } = this.eventContext();
    const targetPlayer = game.get(targetPlayerId);

    const eventData = { chip: {} };
    for (const company of targetPlayer.decks.company.items()) {
      for (const chip of [...company.decks.outer.items(), ...company.decks.inner.items()]) {
        eventData.chip[chip.id()] = { selectable: true };
      }
    }

    return eventData;
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
    this.selectTargetPlayerAction();
  },
  handlers: {
    TRIGGER({ target, diplomatAction }) {
      const {
        game,
        player,
        source: card,
        data: { selectedChipId, cardOwnerId, targetPlayerId },
      } = this.eventContext();
      let targetPlayer = game.get(targetPlayerId);
      let selectedChip = game.get(selectedChipId);
      const cardOwner = game.get(cardOwnerId);

      if (!cardOwner) {
        this.data.cardOwnerId = target.id();
        this.selectTargetPlayerAction();
        return { preventListenerRemove: true };
      }

      if (!targetPlayer) {
        this.data.targetPlayerId = target.id();
        targetPlayer = target;

        const eventData = this.busterSelectAction();

        if (Object.keys(eventData.chip).length === 0) {
          player.notifyUser({ message: 'У игроков нет доступных ресурсов' });
          this.emit('RESET');
          return;
        }

        player.set({
          eventData: { player: null },
          staticHelper: { text: 'Ожидается действие со стороны игрока' },
        });

        targetPlayer.activate().set({
          staticHelper: {
            text: `Против тебя хотят применить бустер <a>${card.title}</a>. Применить бустер <a>ДИПЛОМАТ</a> для защиты?`,
            buttons: [
              { text: 'Использовать <a>ДИПЛОМАТ</a>', code: 'USE_DIPLOMAT' },
              { text: 'Ничего не делать', code: 'USE_DIPLOMAT', eventData: { doNothing: true } },
            ],
          },
          eventData: {
            deal: { diplomatEvent: { playerId: player.id(), eventCode: this.code() } },
            playEnabled: game.players().reduce((acc, p) => {
              if (p !== targetPlayer && p.decks.buster.items().length > 0) acc[p.id()] = true;
              return acc;
            }, {}),
          },
        });

        player.deactivate();

        return { preventListenerRemove: true };
      }

      if (diplomatAction) {
        player.activate();

        const diplomatBuster = game.get(diplomatAction.busterId);
        if (diplomatBuster) {
          diplomatBuster.moveToDrop();

          player.notifyUser({ message: 'Действие отменено, так как игрок применил бустер <a>ДИПЛОМАТ</a>' });
          return this.emit('RESET', { success: true });
        } else {
          targetPlayer
            .deactivate()
            .set({ staticHelper: null, eventData: { playEnabled: null } })
            .notifyUser({ message: diplomatAction.message });
        }

        const eventData = this.busterSelectAction();
        player.set({ eventData, staticHelper: { text: 'Необходимо выбрать нужный ресурс', buttons: null } });
        return { preventListenerRemove: true };
      }

      if (!selectedChip) {
        selectedChip = target;
        this.data.selectedChipId = selectedChip.id();

        const eventData = { company: {}, deck: {}, chip: {}, player: {} };

        for (const chipId of Object.keys(player.eventData.chip)) eventData.chip[chipId] = null;

        const initEventData = JSON.stringify(eventData);

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
          if(!domain.game.events.company[company.subtype]) continue;

          eventData.company[company.id()] = { selectable: true };
        }

        for (const [companyId, { playerId }] of Object.entries(cardOwner.acquired?.company || {})) {
          const company = game.get(companyId);
          if (company.subtype !== selectedChip.value && company.subtype !== 'construction') continue;
          if(!domain.game.events.company[company.subtype]) continue;

          eventData.player[playerId] = { highlight: true };
          eventData.company[companyId] = { selectable: true };
        }

        const rouletteChip = game.roulettes.main.chip();
        if (rouletteChip?.value === selectedChip.value) eventData.chip[rouletteChip.id()] = { selectable: true };

        if (initEventData === JSON.stringify(eventData)) {
          // !!! тут не доделана логика с тем, что ресурс можно было бы отдать кому то из игроков
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
          const event = target.initEvent(selectedChip.value, {
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
