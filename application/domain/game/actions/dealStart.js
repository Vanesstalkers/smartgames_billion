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
        if (chip.ownerId) continue;
        resources[card.group] = { title: card.title, chipId: chip.id() };
      }

      const companies = {};
      for (const company of this.data.seller.decks.industry.items() || []) {
        if (company.used) continue;
        companies[company.subtype] = { title: company.getTitle(), companyId: company.id() };
      }

      player.set({
        eventData: {
          deal: { sellerId: this.data.seller.id(), resources, companies },
          controlBtn: { label: 'Отменить сделку', resetEvent: true },
        },
      });
      this.data.seller.set({ eventData: { deal: { buyerId: player.id() } } });
    },
    handlers: {
      async TRIGGER({ dealType, amount, payType, group, initPlayer, target }) {
        const { game, player } = this.eventContext();

        player.set({
          staticHelper: {
            text: `Продавец оценивает предложение...`,
          },
        });

        let text = '';
        switch (dealType) {
          case 'buyResource': {
            const chip = game.get(player.eventData.deal.resources[group].chipId);

            text = `Игрок <b>${
              player.userName
            }</b> предлагает купить ресурс: <a>${chip.getTitle()}</a> за <a>${amount} ₽₽₽</a> на условии <a>${
              payType === 'deferred' ? 'с отсрочкой оплаты' : 'с оплатой сразу'
            }</a>. Согласны продать на этих условиях?`;

            break;
          }
          case 'borrowMoney': {
            text = `Игрок <b>${player.userName}</b> просит одолжить деньги в размере <a>${amount} ₽₽₽</a>. Вы согласны?`;

            break;
          }

          case 'useService': {
            const company = game.get(player.eventData.deal.companies[group].companyId);

            text = `Игрок <b>${
              player.userName
            }</b> просит воспользоваться услугой: <a>${company.getTitle()}</a> за <a>${amount} ₽₽₽</a> на условии <a>${
              payType === 'deferred' ? 'с отсрочкой оплаты' : 'с оплатой сразу'
            }</a>. Согласны продать на этих условиях?`;

            // text = `Игрок <b>${
            //   player.userName
            // }</b> предлагает купить ресурс: <a>${chip.getTitle()}</a> за <a>${amount} ₽₽₽</a> на условии <a>${
            //   payType === 'deferred' ? 'с отсрочкой оплаты' : 'с оплатой сразу'
            // }</a>. Согласны продать на этих условиях?`;

            break;
          }
        }

        this.data.seller.set({
          eventData: {
            deal: { dealType, buyerId: initPlayer.id(), group, amount, payType },
            disableActivePlayerCheck: true,
          },
          staticHelper: {
            text,
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
