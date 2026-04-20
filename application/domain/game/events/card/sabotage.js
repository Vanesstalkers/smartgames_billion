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
    TRIGGER({ target }) {
      const { game, player, data: { targetPlayerId } = {}, source: card } = this.eventContext();
      let targetPlayer = game.get(targetPlayerId);
      const eventData = { chip: {}, player: null };

      if (!targetPlayer) {
        this.data.targetPlayerId = target.id();
        targetPlayer = target;
      } else {
        target.parent().removeItem(target, { forceDelete: true });
        this.data.count--;
      }

      for (const company of targetPlayer.decks.company.items()) {
        for (const chip of [...company.decks.outer.items(), ...company.decks.inner.items()]) {
          eventData.chip[chip.id()] = { selectable: true };
        }
      }

      if (this.data.count === 3 && Object.keys(eventData.chip).length === 0) {
        player.notifyUser({ message: 'У игрока нет доступных ресурсов' });
        this.emit('RESET');
        return;
      }

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
