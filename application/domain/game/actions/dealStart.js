(async function ({ targetId } = {}, player) {
  // ??? проверить что это работает
  const active = player.eventData.activeEvents || [];
  const existingDeal = active.find((ev) => ev.name === 'deal');
  if (existingDeal) existingDeal.emit('RESET');

  const event = player.initEvent({
    name: 'deal',
    data: { seller: this.get(targetId) },
    init() {
      const { player } = this.eventContext();

      this.data.prevControlBtn = JSON.stringify(player.eventData.controlBtn);

      const resources = {};
      for (const card of domain.game.configs.cards({ unique: true })) {
        const chip = this.data.seller.getChipBySubtype(card.group);
        if (!chip) continue;
        resources[card.group] = { title: card.title, chipId: chip.id() };
      }

      player.set({
        eventData: {
          deal: { sellerId: this.data.seller.id(), resources },
          controlBtn: { label: 'Отменить сделку', resetEvent: true },
        },
      });
      this.data.seller.set({ eventData: { deal: { buyerId: player.id() } } });
    },
    handlers: {
      async TRIGGER({ amount, payType, group, initPlayer }) {
        const { game, player } = this.eventContext();
        const chip = game.get(player.eventData.deal.resources[group].chipId);

        player.set({
          staticHelper: {
            text: `Продавец оценивает предложение...`,
          },
        });
        this.data.seller.set({
          eventData: { deal: { buyerId: initPlayer.id(), group, amount, payType }, disableActivePlayerCheck: true },
          staticHelper: {
            text: `Игрок <b>${
              player.userName
            }</b> предлагает купить ресурс: <a>${chip.getTitle()}</a> за <a>${amount}</a> на условии <a>${
              payType === 'deferred' ? 'с отсрочкой оплаты' : 'с оплатой сразу'
            }</a>. Согласны продать на этих условиях?`,
            buttons: [
              { text: 'Согласиться', code: 'ACCEPT_DEAL' },
              { text: 'Отказаться', code: 'DECLINE_DEAL' },
            ],
          },
        });

        this.emit('RESET');
      },
      END_ROUND() {
        this.emit('RESET');
      },
      RESET() {
        const { player, game } = this.eventContext();

        const controlBtn = this.data.prevControlBtn
          ? { ...JSON.parse(this.data.prevControlBtn), resetEvent: null }
          : null;
        player.set({ eventData: { controlBtn } });

        this.destroy();
      },
    },
  });

  if (event) {
    const user = lib.store('user').get(player.userId);
    const tutorialPayload = { tutorial: 'game-tutorial-deal' };
    if (user.currentTutorial?.active) tutorialPayload.action = 'changeTutorial';
    await user.updateTutorial(tutorialPayload);
  }
});
