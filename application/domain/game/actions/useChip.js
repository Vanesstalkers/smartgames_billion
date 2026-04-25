(function ({ chipId, selectedChipSubtype } = {}, player) {
  const game = this;

  if (selectedChipSubtype) {
    return player.handleEventWithTriggerListener('TRIGGER', { selectedChipSubtype });
  }

  player.initEvent({
    name: 'useChipEvent',
    data: {
      chipId,
    },
    init: function () {
      const { game, player, data: { chipId } = {} } = this.eventContext();
      const chip = game.get(chipId);

      const eventData = { company: {}, player: {} };
      let constructionCompany;
      for (const company of player.decks.company.items() || []) {
        if (company.is('construction')) {
          constructionCompany = company;
          continue;
        }
        if (company.played || company.subtype !== chip.value) continue;
        if(!domain.game.events.company[company.subtype]) continue;

        eventData.company[company.id()] = { selectable: true };
      }
      if (Object.keys(eventData.company).length == 0 && constructionCompany) {
        eventData.company[constructionCompany.id()] = { selectable: true };
      }

      for (const [companyId, { playerId }] of Object.entries(player.acquired?.company || {})) {
        const company = game.get(companyId);
        if (company.played || company.subtype !== chip.value) continue;
        if(!domain.game.events.company[company.subtype]) continue;
        
        eventData.player[playerId] = { highlight: true };
        eventData.company[companyId] = { selectable: true };
      }

      if (Object.keys(eventData.company).length === 0) {
        player.notifyUser('Нет доступных предприятий для выполнения действия');
        return { resetEvent: true };
      }

      eventData.controlBtn = { label: 'Отменить действие', resetEvent: true };
      player.set({ eventData });
    },
    handlers: {
      TRIGGER({ target }) {
        const { game, player, data: { targetId, chipId } = {} } = this.eventContext();
        const chip = game.get(chipId);

        if (target) {
          this.data.targetId = target.id();

          player.set({
            staticHelper: {
              text: `Подтверждаете использование услуги <a>${chip.title}</a>?`,
              buttons: [
                { text: 'Подтвердить', triggerEvent: true },
                { text: 'Отменить', resetEvent: true },
              ],
            },
          });

          return { preventListenerRemove: true };
        }
        target = game.get(targetId);

        if (player !== target.getPlayer()) {
          player.set({ acquired: { company: { [target.id()]: null } } });
        }

        this.emit('RESET');

        if (target.is('construction')) {
          if (!domain.game.events?.company?.[chip.value]) {
            player.notifyUser(`Событие предприятия <a>${chip.title}</a> не найдено`, { displayForced: true });
            return;
          }

          const event = target.initEvent(chip.value, {
            ...{ game, player, allowedPlayers: [player] },
            onSuccess: () => chip.delete(),
          });

          if (event) {
            event.name = this.title;
            if (player) player.addEvent(event);
          }
        } else target.play({ player, onSuccess: () => chip.delete() });
      },
      RESET() {
        const { game, player, beforeEventControlBtn: controlBtn } = this.eventContext();

        player.set(
          { eventData: { controlBtn, company: null, player: null }, staticHelper: null },
          { reset: ['eventData.controlBtn', 'staticHelper', 'eventData.company', 'eventData.player'] }
        );

        this.destroy();
      },
    },
  });
});
