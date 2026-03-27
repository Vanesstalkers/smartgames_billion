(function () {
  this.initEvent(
    {
      name: 'initPrepareGameEvents',
      initPrepareStep(player) {
        const { game } = this.eventContext();
        const playerHand = player.find('Deck[card_industry]');
        const decks = Object.values(game.decks).filter((d) => d.subtype !== 'buster');

        for (const deck of decks) {
          const sourceDeck = game.find(`Deck[card_${deck.subtype}]`);
          if (!sourceDeck || sourceDeck.itemsCount() <= 0) continue;

          const card = sourceDeck.getRandomItem();
          card.set({ eventData: { activeEvents: [this], cardClass: 'selectable', buttonText: 'Выбрать' } });
          card.moveToTarget(playerHand);
        }

        player.activate({
          setData: { eventData: { controlBtn: { label: 'Помочь с выбором', triggerEvent: true } } },
        });
        player.setEventWithTriggerListener(this);
        lib.timers.timerRestart(game, { time: game.settings.timer });
      },
      init() {
        const { game } = this.eventContext();

        game.set({ statusLabel: 'Подготовка к игре', status: 'PREPARE_START' });
        this.initPrepareStep(game.selectNextActivePlayer());
      },
      handlers: {
        TRIGGER({ target: selectedCard, timerAutoPick }) {
          const { game, player } = this.eventContext();

          if (!selectedCard) selectedCard = player.decks.industry.getRandomItem();

          for (const card of player.decks.industry.items()) {
            card.set({ eventData: { activeEvents: [], cardClass: null, buttonText: null } });
            if (selectedCard && card.id() === selectedCard.id()) continue;
            card.moveToDeck();
          }
          player.deactivate({ setData: { eventData: { controlBtn: null, playDisabled: null } } });

          game.logs({
            msg: `Игрок {{player}} выбрал стартовую карту "${selectedCard.getTitle()}"${
              timerAutoPick ? ' (автоматический выбор).' : '.'
            }`,
            userId: player.userId,
          });

          const prepareReady = game.players().every((p) => (p.decks.industry?.itemsCount() || 0) > 0);
          if (prepareReady) {
            this.emit('RESET');
            game.run('startGame');
            return;
          }

          this.initPrepareStep(game.selectNextActivePlayer());
          return { preventListenerRemove: true };
        },
        PLAYER_TIMER_END({ initPlayer: player }) {
          this.emit('TRIGGER', { timerAutoPick: true }, player);
          return { preventListenerRemove: true };
        },
      },
    },
    { allowedPlayers: this.players() }
  );
});
