(function () {
  this.initEvent(
    {
      name: 'initPrepareGameEvents',
      initPrepareStep(player) {
        const { game } = this.eventContext();
        const decks = Object.values(game.decks).filter((d) => d.type === 'company');

        const eventData = { company: {} };
        for (const deck of decks) {
          const card = deck.getRandomItem();
          card.set({ eventData: { activeEvents: [this], buttonText: 'Выбрать' } });
          card.moveToTarget(player.decks.industry);
          eventData.company[card.id()] = { selectable: true };
        }

        eventData.controlBtn = { label: 'Помочь выбрать', triggerEvent: true };
        player.activate({ setData: { eventData } });
        player.setEventWithTriggerListener(this);

        lib.timers.timerRestart(game, { time: game.settings.timer });
      },
      init() {
        const { game } = this.eventContext();

        // for (const player of game.players()) {
        //   const decks = Object.values(game.decks).filter((d) => d.type === 'company');
        //   for (const deck of decks) {
        //     const card = deck.getRandomItem();
        //     card.moveToTarget(player.decks.industry);
        //     card.restoreResources();
        //   }
        // }

        // game.run('startGame');
        // return { resetEvent: true };

        game.set({ statusLabel: 'Подготовка к игре', status: 'PREPARE_START' });
        this.initPrepareStep(game.selectNextActivePlayer());
      },
      handlers: {
        TRIGGER({ target: selectedCompany, timerAutoPick }) {
          const { game, player } = this.eventContext();

          if (!selectedCompany) selectedCompany = player.decks.industry.getRandomItem();

          for (const company of player.decks.industry.items()) {
            company.set({ eventData: { activeEvents: [], cardClass: null, buttonText: null } });
            if (selectedCompany && company.id() === selectedCompany.id()) continue;
            company.moveToDeck();
          }
          player.deactivate({ setData: { eventData: { company: null, controlBtn: null, playDisabled: null } } });

          selectedCompany.restoreResources();

          game.logs({
            msg: `Игрок {{player}} выбрал стартовую карту "${selectedCompany.getTitle()}"${
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
        RESET() {
          const { game } = this.eventContext();

          for (const player of game.players()) {
            player.removeEventWithTriggerListener();
          }

          this.destroy();
        },
      },
    },
    { allowedPlayers: this.players() }
  );
});
