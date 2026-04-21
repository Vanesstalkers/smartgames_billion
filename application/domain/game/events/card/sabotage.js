() => ({
  tutorial: {
    text: `Удали три ресурса у любого игрока с тремя предприятиями, можно из разных индустрий`,
    showTitle: true,
    superPos: true,
  },
  data: {
    count: 3,
    targetPlayerId: null,
  },
  busterSelectAction() {
    const { game, data: { targetPlayerId } = {} } = this.eventContext();
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

    const eventData = { player: {} };
    for (const p of game.players()) {
      if (p === player && !player.gameMaster) continue;
      eventData.player[p.id()] = { selectable: true };
    }

    player.set({
      eventData,
      staticHelper: { text: 'Выберите игрока, у которого нужно удалить ресурсы', buttons: null },
    });
  },
  handlers: {
    TRIGGER({ target, diplomatAction }) {
      const { game, player, source: card, data: { targetPlayerId } = {} } = this.eventContext();
      let targetPlayer = game.get(targetPlayerId);

      if (!targetPlayer) {
        this.data.targetPlayerId = target.id();
        targetPlayer = target;

        const eventData = this.busterSelectAction();

        if (Object.keys(eventData.chip).length === 0) {
          player.notifyUser({ message: 'У игрока нет доступных ресурсов' });
          this.emit('RESET');
          return;
        }

        player.set({ staticHelper: { text: 'Ожидается действие со стороны игрока' } });

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
      } else {
        target.parent().removeItem(target, { forceDelete: true });
        this.data.count--;
      }

      const eventData = { ...this.busterSelectAction(), player: null };
      player.set({
        eventData,
        staticHelper: { text: `Выберите ресурсы для удаления (<a>осталось ${this.data.count}</a>)`, buttons: null },
      });

      if (this.data.count > 0 && Object.keys(eventData.chip).length > 0) return { preventListenerRemove: true };

      this.emit('RESET', { success: true });
    },
    RESET({ success } = {}) {
      const { game, player, source: card } = this.eventContext();

      player.set({ eventData: { chip: null, player: null }, staticHelper: null });

      if (success) card.moveToDrop();
      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
