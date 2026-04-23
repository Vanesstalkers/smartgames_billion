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
        contractorCompanies[company.subtype] = { title: company.getTitle(), companyId: company.id() };
      }

      const playerCompanies = {};
      for (const company of player.decks.company.items() || []) {
        if (company.played) continue;
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
      async TRIGGER({ dealType, amount, payType, group, initPlayer, target, repayType }) {
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
            } else if (repayType === 'booster') {
              repayDescription = 'Возврат предполагается бустером.';
            } else if (repayType === 'resource') {
              const br = group && player.eventData.deal.playerResources?.[group];
              const pledgeChip = br ? game.get(br.chipId) : null;
              repayDescription = pledgeChip
                ? `Возврат предполагается ресурсом: <a>${pledgeChip.getTitle()}</a>.`
                : 'Возврат предполагается ресурсом.';
            } else if (repayType === 'service') {
              const pc = group && player.eventData.deal.playerCompanies?.[group];
              const pledgeCo = pc ? game.get(pc.companyId) : null;
              repayDescription = pledgeCo
                ? `Возврат предполагается услугой: <a>${pledgeCo.getTitle()}</a>.`
                : 'Возврат предполагается услугой.';
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
        if (repayType === 'resource' && group && player.eventData.deal.playerResources?.[group]) {
          repayChipId = player.eventData.deal.playerResources[group].chipId;
        }

        let repayCompanyId;
        if (repayType === 'service' && group && player.eventData.deal.playerCompanies?.[group]) {
          repayCompanyId = player.eventData.deal.playerCompanies[group].companyId;
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
