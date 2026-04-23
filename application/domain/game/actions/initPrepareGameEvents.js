(function () {
  this.initEvent(
    {
      name: 'initPrepareGameEvents',
      data: {},
      initPrepareStep(player) {
        const { game } = this.eventContext();
        const decks = Object.values(game.decks).filter((d) => d.type === 'company');

        const eventData = { company: {} };
        for (const deck of decks) {
          const card = deck.getRandomItem();
          if (!card) continue;

          card.set({ eventData: { activeEvents: [this], buttonText: 'Выбрать' } });
          card.moveToTarget(player.decks.company);
          eventData.company[card.id()] = { selectable: true };
        }

        eventData.controlBtn = { label: 'Помочь выбрать', triggerEvent: true };
        player.activate({ setData: { eventData } });
        player.setEventWithTriggerListener(this);

        lib.timers.timerRestart(game, { time: game.settings.timer });
      },
      init() {
        const { game } = this.eventContext();

        for (const player of game.players()) {
          const cards = domain.game.configs.cards({ selectGroup: 'buster', unique: true });
          for (const card of cards) {
            game.decks.buster.select({ attr: { name: card.name } })[0].moveToTarget(player.decks.buster);
          }
          // const decks = Object.values(game.decks).filter((d) => d.type === 'company');
          // for (const deck of decks) {
          //   const card = deck.getRandomItem();
          //   card.moveToTarget(player.decks.company, { restoreResources: true });
          // }
        }

        // game.run('startGame');
        // return { resetEvent: true };

        game.set({ statusLabel: 'Подготовка к игре', status: 'PREPARE_START' });
        this.initPrepareStep(game.selectNextActivePlayer());
      },
      handlers: {
        TRIGGER({ target, selectedChipSubtype, timerAutoPick }) {
          const { game, player, data } = this.eventContext();
          let selectedCompany = game.get(data.selectedCompanyId);

          if (!selectedCompany) {
            selectedCompany = target || player.decks.company.getRandomItem();
            this.data.selectedCompanyId = selectedCompany.id();

            for (const company of player.decks.company.items()) {
              company.set({ eventData: { activeEvents: [], cardClass: null, buttonText: null } });
              if (company === selectedCompany) continue;
              company.moveToDeck();
            }

            if (selectedCompany.is('construction')) {
              const eventData = { deck: {}, company: null };
              for (const deck of Object.values(game.decks)) {
                if (deck.type !== 'company') continue;
                eventData.deck[deck.id()] = { selectable: 'chip' };
              }

              eventData.controlBtn = { label: 'Помочь выбрать', triggerEvent: true };
              const staticHelper = {
                text: `Необходимо выбрать ресурс для добавления на предприятие`,
                buttons: null,
              };
              player.set({ eventData, staticHelper });

              return { preventListenerRemove: true };
            }
          }

          player.deactivate({
            setData: {
              staticHelper: null,
              eventData: { deck: null, company: null, controlBtn: null, playDisabled: true },
            },
            setDataConfig: { reset: ['eventData.controlBtn', 'staticHelper'] },
          });

          selectedCompany.restoreResources();

          if (selectedCompany.is('construction')) {
            if (!selectedChipSubtype) {
              const resources = Object.keys(game.resources());
              selectedChipSubtype = resources[Math.floor(Math.random() * resources.length)];
            }
            const chip = { value: selectedChipSubtype, title: game.resources(selectedChipSubtype).title };
            selectedCompany.decks.outer.addItem(chip);
          }

          if (selectedCompany.is('art')) {
            game.decks.buster.moveRandomItems({ count: 2, target: player.decks.buster });
          }

          game.logs({
            msg: `Игрок {{player}} выбрал стартовую карту "${selectedCompany.getTitle()}"${
              timerAutoPick ? ' (автоматический выбор).' : '.'
            }`,
            userId: player.userId,
          });

          const prepareReady = game.players().every((p) => (p.decks.company?.itemsCount() || 0) > 0);
          if (prepareReady) {
            this.emit('RESET');
            game.run('startGame');
            return;
          }

          this.data.selectedCompanyId = null;
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
