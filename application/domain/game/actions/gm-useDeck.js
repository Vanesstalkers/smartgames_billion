(function ({ deckId } = {}, player) {
  player.initEvent({
    name: 'useDeckEvent',
    data: {
      deckId,
    },
    init: function () {
      const { game, player, data: { deckId } = {} } = this.eventContext();
      const deck = game.get(deckId);

      if (game.status !== 'IN_PROCESS') throw new Error('Действие доступно только после начала игры');
      if (deck.items().length === 0) throw new Error('В колоде нет доступных предприятий');

      let staticHelper = {};

      if (deck.subtype === 'buster') {
        staticHelper.text = 'Хотите приобрести бустер?';
        staticHelper.buttons = [
          { text: 'Купить за <b><a>10₽</a></b>', triggerEvent: true },
          { text: 'Отказаться', resetEvent: true },
        ];
      } else {
        if (player.eventData.deck?.[deckId]?.selectable) {
          // finance-card event
          player.handleEventWithTriggerListener('TRIGGER', { targetId: deckId });
          return;
        } else {
          staticHelper.text = `Хотите приобрести или обменять <a>${deck.title}</a>?`;
          staticHelper.buttons = [
            { text: 'Купить за <b><a>25₽</a></b>', triggerEvent: true },
            { text: 'Обменять за <b><a>10₽</a></b>', triggerEvent: true, eventData: { changeCompanyEvent: true } },
          ];
        }
      }

      player.set({ staticHelper, eventData: { controlBtn: { label: 'Отменить действие', resetEvent: true } } });
    },
    handlers: {
      TRIGGER({ target: targetPlayer, button: { eventData: { changeCompanyEvent } = {} } = {} }) {
        const {
          game,
          player,
          data: { deckId },
        } = this.eventContext();
        const deck = game.get(deckId);

        if (!targetPlayer) {
          if (changeCompanyEvent) this.data.changeCompanyEvent = true;

          const eventData = { player: {} };
          for (const player of game.players()) {
            eventData.player[player.id()] = { selectable: true };
          }
          player.set({ eventData });

          return { preventListenerRemove: true };
        }

        if (deck.subtype === 'buster') {
          deck.getRandomItem().moveToTarget(targetPlayer.decks.buster, {
            restoreResources: true,
          });

          const price = 10;
          targetPlayer.set({ money: targetPlayer.money - price });

          game.logs({
            msg: `Игрок <a>{{player}}</a> приобрел бустер за <a>${price}₽</a>`,
            userId: targetPlayer.userId,
          });
          targetPlayer.notifyUser(`Вы приобрели бустер за <a>${price}₽</a>`);

          return this.emit('RESET', { success: true });
        } else {
          if (this.data.changeCompanyEvent) {
            this.emit('RESET');

            return player.initEvent(domain.game.events.company.light(), {
              initData: { sourceDeck: deck, targetPlayerId: targetPlayer.id(), price: 10 },
            });
          }

          this.emit('RESET', { success: true });

          game.run('buyCompany', { player: targetPlayer, deck, price: 25 }, player);
        }
      },
      RESET({ success }) {
        const { game, player, beforeEventControlBtn: controlBtn } = this.eventContext();

        player.set(
          { eventData: { player: null, controlBtn }, staticHelper: null },
          { reset: ['eventData.controlBtn', 'staticHelper'] }
        );

        this.emit(success ? 'SUCCESS' : 'FAILED');
        this.destroy();
      },
    },
  });
});
