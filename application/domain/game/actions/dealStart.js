(async function ({ targetId } = {}, player) {
  if (targetId === player.id()) {
    player.showDealsHelper();
    return;
  }

  const event = player.initEvent({
    name: 'deal',
    data: {
      contractorId: targetId,
      beforeEnterStaticHelper: player.staticHelper ? lib.utils.structuredClone(player.staticHelper) : null,
    },
    init() {
      const { game, player, data: { contractorId } = {} } = this.eventContext();
      const contractor = game.get(contractorId);

      const playerResources = {};
      for (const card of domain.game.configs.cards({ unique: true })) {
        const chip = player.getChipBySubtype(card.group);
        if (!chip) continue;
        playerResources[card.group] = { title: card.title, chipId: chip.id() };
      }

      const contractorResources = {};
      for (const card of domain.game.configs.cards({ unique: true })) {
        const chip = contractor.getChipBySubtype(card.group);
        if (!chip) continue;
        contractorResources[card.group] = { title: card.title, chipId: chip.id() };
      }

      const contractorCompanies = {};
      for (const company of contractor.decks.company.items() || []) {
        if (company.played) continue;
        if (!domain.game.events.company[company.subtype]) continue;
        contractorCompanies[company.subtype] = { title: company.getTitle(), companyId: company.id() };
      }

      const playerCompanies = {};
      for (const company of player.decks.company.items() || []) {
        if (company.played) continue;
        if (!domain.game.events.company[company.subtype]) continue;
        playerCompanies[company.subtype] = { title: company.getTitle(), companyId: company.id() };
      }

      const playerBusters = {};
      for (const buster of player.decks.buster.items() || []) {
        playerBusters[buster.name] = { title: buster.title, busterId: buster.id() };
      }

      player.set({
        eventData: {
          deal: {
            contractorId,
            contractorResources,
            contractorCompanies,
            playerResources,
            playerCompanies,
            playerBusters,
          },
          controlBtn: { label: 'Отменить сделку', resetEvent: true },
        },
      });
      contractor.set({ eventData: { deal: { contractorId: player.id() } } });
    },
    handlers: {
      async TRIGGER({ dealType, amount, code, payType, initPlayer }) {
        const {
          game,
          player,
          data: { contractorId },
        } = this.eventContext();
        const contractor = game.get(contractorId);

        player.set({
          staticHelper: {
            text: `Продавец оценивает предложение...`,
          },
        });

        const deal = {
          dealType,
          contractorId: initPlayer.id(),
          code,
          amount,
          payType,
        };
        const payTypeText = payType === 'deferred' ? 'с отсрочкой оплаты' : 'с оплатой сразу';
        let text = '';

        switch (dealType) {
          case 'buyResource': {
            const chipId = player.eventData.deal.contractorResources[code].chipId;
            const chip = game.get(chipId);

            text = `Игрок <a>${player.getUserName()}</a> предлагает купить у Вас ресурс: <a>${chip.getTitle()}</a> за <a>${amount}₽</a> на условии <a>${payTypeText}</a>. Согласны продать свой ресурс на этих условиях?`;

            deal.chipId = chipId;
            break;
          }
          case 'borrowMoney': {
            text = `Игрок <a>${player.userName}</a> просит одолжить деньги в размере <a>${amount}₽</a>. Вы согласны?`;
            break;
          }
          case 'saleResource': {
            const chipId = player.eventData.deal.playerResources[code].chipId;
            const chip = game.get(chipId);

            text = `Игрок <a>${player.getUserName()}</a> предлагает Вам ресурс: <a>${chip.getTitle()}</a> за <a>${amount}₽</a> на условии <a>${payTypeText}</a>. Согласны купить ресурс на этих условиях?`;

            deal.chipId = chipId;
            break;
          }
          case 'saleService': {
            const companyId = player.eventData.deal.playerCompanies[code].companyId;
            const company = game.get(companyId);

            text = `Игрок <a>${player.getUserName()}</a> предлагает Вам услугу: <a>${company.getTitle()}</a> за <a>${amount}₽</a> на условии <a>${payTypeText}</a>. Согласны её купить на этих условиях?`;

            deal.companyId = companyId;
            break;
          }
          case 'saleBuster': {
            const busterId = player.eventData.deal.playerBusters[code].busterId;
            const buster = game.get(busterId);

            text = `Игрок <a>${player.getUserName()}</a> предлагает Вам бустер: <a>${buster.getTitle()}</a> за <a>${amount}₽</a> на условии <a>${payTypeText}</a>. Согласны его купить на этих условиях?`;

            deal.busterId = busterId;
            break;
          }

          case 'useService': {
            const companyId = player.eventData.deal.contractorCompanies[code].companyId;
            const company = game.get(companyId);

            text = `Игрок <a>${player.getUserName()}</a> просит воспользоваться услугой: <a>${company.getTitle()}</a> за <a>${amount}₽</a> на условии <a>${payTypeText}</a>. Согласны продать услугу на этих условиях?`;

            deal.companyId = companyId;
            break;
          }
          // case 'customDeal': {
          //   text = `Игрок <a>${player.getUserName()}</a> предлагает Вам сделку на условии <a>${payTypeText}</a>. Суть сделки: <a><p>${custom}</p></a>. Согласны заключить такую сделку?`;
          //   deal.custom = custom;
          //   break;
          // }
        }

        contractor.set({
          eventData: { deal, disableActivePlayerCheck: true },
          staticHelper: {
            text,
            buttons: [
              { text: 'Согласиться', code: 'ACCEPT_DEAL' },
              { text: 'Отказаться', code: 'DECLINE_DEAL' },
            ],
          },
        });

        // this.emit('RESET');
      },
      END_ROUND() {
        this.emit('RESET');
      },
      RESET() {
        const {
          player,
          beforeEventControlBtn: controlBtn,
          data: { beforeEnterStaticHelper = null } = {},
        } = this.eventContext();

        player.set(
          { eventData: { controlBtn }, staticHelper: beforeEnterStaticHelper },
          { reset: ['eventData.controlBtn'] }
        );

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
