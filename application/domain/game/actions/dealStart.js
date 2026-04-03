(async function ({ targetId } = {}, player) {
  const seller = this.get(targetId);

  function firstSellerChipForSubtype(sellerPlayer, subtype) {
    const industry = sellerPlayer.decks?.industry;
    if (!industry) return null;
    for (const company of industry.items() || []) {
      if (typeof company._ensureCompanyDecks === 'function') company._ensureCompanyDecks();
      for (const deck of [company.decks?.outer, company.decks?.inner].filter(Boolean)) {
        for (const chip of deck.items() || []) {
          if (company.subtype === subtype || chip.value === subtype || chip.subtype === subtype) {
            return chip;
          }
        }
      }
    }
    return null;
  }

  function industryTypeKeyForChip(chip) {
    let p = chip.parent();
    while (p) {
      if (p.matches?.({ className: 'Player' })) break;
      if (p.matches?.({ className: 'Card' }) && p.subtype) return p.subtype;
      p = p.parent();
    }
    return chip.value || chip.subtype || null;
  }

  function firstSellerIndustryChipByType(sellerPlayer, typeKey) {
    if (!typeKey) return null;
    const industry = sellerPlayer.decks?.industry;
    if (!industry) return null;
    for (const company of industry.items() || []) {
      if (typeof company._ensureCompanyDecks === 'function') company._ensureCompanyDecks();
      for (const deck of [company.decks?.outer, company.decks?.inner].filter(Boolean)) {
        for (const chip of deck.items() || []) {
          if (chip.disabled) continue;
          if (company.subtype === typeKey || chip.value === typeKey || chip.subtype === typeKey) {
            return chip;
          }
        }
      }
    }
    return null;
  }

  const active = player.eventData.activeEvents || [];
  const existingDeal = active.find((ev) => ev.name === 'deal');
  if (existingDeal) existingDeal.emit('RESET');

  const event = player.initEvent({
    name: 'deal',
    data: { seller },
    init() {
      const { player } = this.eventContext();

      this.data.prevControlBtn = JSON.stringify(player.eventData.controlBtn);

      player.set({
        eventData: { dealSellerId: seller.id(), controlBtn: { label: 'Отменить сделку', resetEvent: true } },
      });
    },
    handlers: {
      async TRIGGER({ amount, payType, chipId, initPlayer }) {
        const { game, player } = this.eventContext();
        const chip = game.get(chipId);
        //   const dealAmount = Number(rawAmount);
        //   if (!Number.isFinite(dealAmount) || dealAmount <= 0) throw new Error('Укажите корректную сумму сделки.');
        //   this.data.dealAmount = dealAmount;
        //   const target = game.get(chipId);
        //   if (!target?.matches?.({ className: 'Chip' })) throw new Error('Ресурс не найден.');
        //   let el = target;
        //   let owner = null;
        //   while (el) {
        //     if (el.matches?.({ className: 'Player' })) {
        //       owner = el;
        //       break;
        //     }
        //     el = el.parent();
        //   }
        //   if (owner !== this.data.seller) throw new Error('Этот ресурс не принадлежит выбранному оппоненту.');
        //   this.data.payment = payment;
        //   const paymentRu =
        //     payment === 'deferred' ? 'отсрочка оплаты (оплата продавцу позже по правилам партии)' : 'оплата сразу';
        //   const resourceLabel = target.getTitle?.() || target.subtype || target.value || 'ресурс';
        //   const sumLine = `<p><b>Сумма сделки:</b> ${dealAmount}.</p>`;
        this.data.seller.set({
          eventData: { dealPlayer: initPlayer, disableActivePlayerCheck: true },
          staticHelper: {
            text: `<p>Игрок <b>${player.userName || 'Покупатель'}</b> предлагает купить ресурс: <b>${
              chip.getTitle() || chip.subtype || chip.value
            }</b> за </p>${amount}<p> на условии <b>${
              payType === 'deferred' ? 'с отсрочкой оплаты' : 'с оплатой сразу'
            }</b>.</p><p>Согласны продать на этих условиях?</p>`,
            buttons: [
              { text: 'Согласиться', dealRespond: 'accept' },
              { text: 'Отказаться', dealRespond: 'decline', exit: true },
            ],
          },
        });
        //   player.set({
        //     staticHelper: {
        //       text: `<p>Вы предложили купить: <b>${resourceLabel}</b> за <b>${dealAmount}</b>.</p><p><b>Условия:</b> ${paymentRu}.</p><p>Ожидайте ответа оппонента.</p>`,
        //     },
        //     eventData: { currentDeal: null },
        //   });
        //   const storeUser = lib.store('user').get(player.userId);
        //   if (storeUser) {
        //     storeUser.set({ currentDeal: { resourceButtons, dealAmount, payment, pendingChipId: chipId } });
        //     await storeUser.saveChanges();
        //   }
        //   const paymentLabel = payment === 'deferred' ? 'с отсрочкой оплаты' : 'с оплатой сразу';
        // game.logs({
        //   msg: `Игрок {{player}} предложил сделку по ресурсу (${paymentLabel}), сумма ${dealAmount}.`,
        //   userId: player.userId,
        // });
        this.emit('RESET');
      },
      async SELLER_RESPOND({ accepted, initPlayer: seller }) {
      //   if (typeof accepted !== 'boolean') throw new Error('Некорректный ответ по сделке.');
      //   if (!seller?.matches?.({ className: 'Player' }) || seller !== this.data.seller) {
      //     throw new Error('Ответить по сделке может только выбранный оппонент-продавец.');
      //   }
      //   const { game, player } = this.eventContext();
      //   seller.set({ staticHelper: null, eventData: { disableActivePlayerCheck: null } });
      //   player.set({ staticHelper: null });
      //   if (accepted) {
      //     const proposedChip = game.get(this.data.pendingChipId);
      //     if (!proposedChip?.matches?.({ className: 'Chip' })) throw new Error('Ресурс по сделке не найден.');
      //     const typeKey = industryTypeKeyForChip(proposedChip);
      //     const handChip = firstSellerIndustryChipByType(this.data.seller, typeKey);
      //     if (!handChip) throw new Error('В отраслевой руке нет подходящего ресурса для сделки.');
      //     handChip.set({
      //       disabled: true,
      //       ownerId: player.id(),
      //       eventData: { workerDealHighlight: null },
      //     });
      //     const prev = player.acquired || {};
      //     player.set({
      //       acquired: {
      //         chip: { ...(prev.chip || {}), [handChip.id()]: {} },
      //         service: { ...(prev.service || {}) },
      //         buster: { ...(prev.buster || {}) },
      //         store: { ...(prev.store || {}) },
      //         other: { ...(prev.other || {}) },
      //       },
      //     });
      //     game.logs({
      //       msg: `Игрок {{player}} согласился с условиями сделки по ресурсу.`,
      //       userId: seller.userId,
      //     });
      //   } else {
      //     game.logs({
      //       msg: `Игрок {{player}} отказался от сделки по ресурсу.`,
      //       userId: seller.userId,
      //     });
      //   }
        this.emit('RESET');
      },
      END_ROUND() {
        this.emit('RESET');
      },
      RESET() {
        const { player, game } = this.eventContext();

        // this.data.payment = null;
        // this.data.seller.set({ staticHelper: null, eventData: { disableActivePlayerCheck: null } });
        // p.set({ staticHelper: null });
        const controlBtn = this.data.prevControlBtn
          ? { ...JSON.parse(this.data.prevControlBtn), resetEvent: null }
          : null;
        player.set({ eventData: { dealSellerId: null, controlBtn } });
        // const storeUser = lib.store('user').get(p.userId);
        // if (storeUser) {
        //   storeUser.set({ currentDeal: { resourceButtons: [] } });
        //   void storeUser.saveChanges();
        // }
        this.destroy();
      },
    },
  });

  if (event) {
    const user = lib.store('user').get(player.userId);
    const tutorialPayload = { tutorial: 'game-tutorial-workerDeal' };
    if (user.currentTutorial?.active) tutorialPayload.action = 'changeTutorial';
    await user.updateTutorial(tutorialPayload);
  }
});
