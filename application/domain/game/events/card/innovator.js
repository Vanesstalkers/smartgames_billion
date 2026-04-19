() => ({
  tutorial: {
    text: 'Воспользуйся своим дополнительным ресурсом как услугой',
    showTitle: true,
    superPos: true,
  },
  data: {
    cardOwnerId: null,
  },
  busterSelectAction() {
    const {
      game,
      player,
      data: { cardOwnerId },
    } = this.eventContext();
    const cardOwner = game.get(cardOwnerId);

    const eventData = { chip: {} };
    for (const company of cardOwner.decks.company.items() || []) {
      for (const chip of company.decks.outer.items() || []) {
        if (chip.disabled) continue;
        eventData.chip[chip.id()] = { selectable: true };
      }
    }

    if (Object.keys(eventData.chip).length === 0) {
      player.notifyUser({ message: 'Нет доступных ресурсов' });
      return { resetEvent: { success: false } };
    }

    player.set({ eventData, staticHelper: { text: 'Какой ресурс нужно использовать?', buttons: null } });
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
        source: card,
        data: { cardOwnerId },
      } = this.eventContext();
      const cardOwner = game.get(cardOwnerId);

      if (!cardOwner) {
        this.data.cardOwnerId = target.id();
        this.busterSelectAction();
        return { preventListenerRemove: true };
      }

      this.emit('RESET', { success: true });

      const chip = target;
      const event = game.initEvent(chip.value, {
        ...{ game, player, allowedPlayers: [player] },
        onSuccess: () => chip.delete(),
        onFailed: () => card.moveToTarget(cardOwner.decks.buster, { setData: { played: false } }),
      });

      if (event) {
        event.name = this.title;
        if (player) player.addEvent(event);
      }
    },
    RESET({ success = false }) {
      const { game, player, source: card } = this.eventContext();

      player.set({ eventData: { chip: null, player: null }, staticHelper: null });

      if (success) card.moveToDrop();
      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
