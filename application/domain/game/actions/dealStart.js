(async function ({ targetId } = {}, player) {
  const event = player.initEvent({
    name: 'deal',
    data: { contractorId: targetId, beforeEnterStaticHelper: lib.utils.structuredClone(player.staticHelper || {}) },
    init() {
      const { game, player, data: { contractorId } = {} } = this.eventContext();
      const contractor = game.get(contractorId);

      const playerResources = {};
      for (const card of domain.game.configs.cards({ unique: true })) {
        const chip = player.getChipBySubtype(card.group);
        if (!chip) continue;
        // if (chip.ownerId) continue;
        playerResources[card.group] = { title: card.title, chipId: chip.id() };
      }

      const contractorResources = {};
      for (const card of domain.game.configs.cards({ unique: true })) {
        const chip = contractor.getChipBySubtype(card.group);
        if (!chip) continue;
        // if (chip.ownerId) continue;
        contractorResources[card.group] = { title: card.title, chipId: chip.id() };
      }

      const contractorCompanies = {};
      for (const company of contractor.decks.company.items() || []) {
        if (company.played) continue;
        if(!domain.game.events.company[company.subtype]) continue;
        contractorCompanies[company.subtype] = { title: company.getTitle(), companyId: company.id() };
      }

      const playerCompanies = {};
      for (const company of player.decks.company.items() || []) {
        if (company.played) continue;
        if(!domain.game.events.company[company.subtype]) continue;
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
      async TRIGGER({ dealType, amount, code, payType, group, initPlayer, target, repayType }) {
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

        let text = '';
        switch (dealType) {
          case 'buyResource': {
            const chip = game.get(player.eventData.deal.contractorResources[group].chipId);

            text = `Игрок <b>${
              player.userName
            }</b> предлагает купить ресурс: <a>${chip.getTitle()}</a> за <a>${amount}₽</a> на условии <a>${
              payType === 'deferred' ? 'с отсрочкой оплаты' : 'с оплатой сразу'
            }</a>. Согласны продать на этих условиях?`;

            break;
          }
          case 'borrowMoney': {
            let repayDescription = '';
            if (repayType === 'money') {
              repayDescription = 'Возврат предполагается деньгами.';
            } else if (repayType === 'buster') {
              repayDescription = `Возврат предполагается бустером <a>${game.busters(code).title}</a>.`;
            } else if (repayType === 'resource') {
              repayDescription = `Возврат предполагается ресурсом: <a>${game.resources(code).title}</a>.`;
            } else if (repayType === 'service') {
              repayDescription = `Возврат предполагается услугой: <a>${game.resources(code).title}</a>.`;
            }
            text = `Игрок <b>${player.userName}</b> просит одолжить деньги в размере <a>${amount}₽</a>.${
              repayDescription ? ` ${repayDescription}` : ''
            } Вы согласны?`;

            break;
          }

          case 'useService': {
            const company = game.get(player.eventData.deal.contractorCompanies[group].companyId);

            text = `Игрок <b>${
              player.userName
            }</b> просит воспользоваться услугой: <a>${company.getTitle()}</a> за <a>${amount}₽</a> на условии <a>${
              payType === 'deferred' ? 'с отсрочкой оплаты' : 'с оплатой сразу'
            }</a>. Согласны продать на этих условиях?`;
            break;
          }
        }

        let repayChipId;
        if (repayType === 'resource' && code && player.eventData.deal.playerResources?.[code]) {
          repayChipId = player.eventData.deal.playerResources[code].chipId;
        }

        let repayCompanyId;
        if (repayType === 'service' && code && player.eventData.deal.playerCompanies?.[code]) {
          repayCompanyId = player.eventData.deal.playerCompanies[code].companyId;
        }

        let repayBusterId;
        if (repayType === 'buster' && code && player.eventData.deal.playerBusters?.[code]) {
          repayBusterId = player.eventData.deal.playerBusters[code].busterId;
        }

        contractor.set({
          eventData: {
            deal: {
              dealType,
              contractorId: initPlayer.id(),
              group,
              amount,
              payType,
              repayType,
              ...(repayChipId && { repayChipId }),
              ...(repayCompanyId && { repayCompanyId }),
              ...(repayBusterId && { repayBusterId }),
            },
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
