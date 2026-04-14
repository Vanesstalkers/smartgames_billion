(function ({ deckId } = {}, player) {
  player.initEvent({
    name: 'useDeckEvent',
    data: {
      deck: this.get(deckId),
    },
    init: function () {
      const {
        game,
        player,
        data: { deck },
      } = this.eventContext();

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
          data: { deck },
        } = this.eventContext();

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
        } else {
          if (this.data.changeCompanyEvent) {
            this.emit('RESET');

            return player.initEvent(domain.game.events.company.light(), {
              initData: { sourceDeck: deck, gameMasterAction: { targetPlayer, price: 10 } },
            });
          }

          deck.getRandomItem().moveToTarget(targetPlayer.decks.company, { restoreResources: true });

          if (targetPlayer.companyCount({ type: 'chemistry' }) > 0) {
            const resources = domain.game.configs.cards({ mapFormat: true });
            for (const company of targetPlayer.decks.company.items()) {
              if (company.decks.inner.items().length === 4) continue;
              company.decks.inner.addItem({ value: company.subtype, title: resources[company.subtype].title });
            }
          }
        }

        const price = 25;
        targetPlayer.set({ money: targetPlayer.money - price });

        game.logs({
          msg:
            deck.subtype === 'buster'
              ? `Игрок <a>{{player}}</a> приобрел бустер за <a>${price}₽</a>`
              : `Игрок <a>{{player}}</a> приобрел предприятие <a>${deck.title}</a> за <a>${price}₽</a>`,
          userId: targetPlayer.userId,
        });
        targetPlayer.notifyUser({
          message:
            deck.subtype === 'buster'
              ? `Вы приобрели бустер за <a>${price}₽</a>`
              : `Вы приобрели предприятие <a>${deck.title}</a> за <a>${price}₽</a>`,
        });

        return this.emit('RESET', { success: true });
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
