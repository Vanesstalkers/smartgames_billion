() => ({
  tutorial: {
    text: 'Устрой кризис любому игроку. При каждом его броске кубиков дохода будет -1 к результату. Отменить действие бустера КРИЗИС можно только с помощью бустера ДИПЛОМАТ.',
    showTitle: true,
    superPos: true,
  },
  init: function () {
    const { game, player } = this.eventContext();

    const eventData = { player: {} };
    for (const p of game.players()) {
      if(p === player) continue;
      eventData.player[p.id()] = { selectable: true };
    }
    player.set({ eventData, staticHelper: { text: 'Против какого игрока нужно использовать бустер?', buttons: null } });
  },
  handlers: {
    TRIGGER({ target }) {
      const { game, player, source: card } = this.eventContext();

      card.moveToTarget(target.decks.income);

      this.emit('RESET', { success: true });
    },
    RESET({ success = false } = {}) {
      const { game, player, source: card } = this.eventContext();

      player.set({ eventData: { player: null }, staticHelper: null });

      this.emit(success ? 'SUCCESS' : 'FAILED');
      this.destroy();
    },
  },
});
