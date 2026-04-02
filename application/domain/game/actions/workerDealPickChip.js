(async function ({ chipId, payment } = {}, buyer) {
  const game = this;

  if (!chipId) throw new Error('Не выбран ресурс.');
  if (payment !== 'immediate' && payment !== 'deferred') throw new Error('Некорректный тип оплаты.');
  if (!buyer?.matches?.({ className: 'Player' })) throw new Error('Игрок не найден.');

  const storeUser = lib.store('user').get(buyer.userId);
  const session = storeUser?.workerDealSession;
  if (!session || session.pendingChipId) {
    throw new Error('Нет активного шага сделки — начните с меню оппонента.');
  }

  const target = game.get(chipId);
  if (!target?.matches?.({ className: 'Chip' })) throw new Error('Ресурс не найден.');

  const sellerObj = game.get(session.sellerPlayerId);
  if (!sellerObj?.matches?.({ className: 'Player' })) throw new Error('Оппонент не найден в игре.');

  let el = target;
  let owner = null;
  while (el) {
    if (el.matches?.({ className: 'Player' })) {
      owner = el;
      break;
    }
    el = el.parent();
  }
  if (owner !== sellerObj) throw new Error('Этот ресурс не принадлежит выбранному оппоненту.');

  const dealAmount = session.dealAmount;

  const nextSession = {
    ...session,
    payment,
    pendingChipId: chipId,
  };

  target.set({ eventData: { workerDealHighlight: true } });

  const paymentRu =
    payment === 'deferred'
      ? 'отсрочка оплаты (оплата продавцу позже по правилам партии)'
      : 'оплата сразу';
  const resourceLabel = target.getTitle?.() || target.subtype || target.value || 'ресурс';
  const sumLine = `<p><b>Сумма сделки:</b> ${dealAmount}.</p>`;

  sellerObj.set({
    eventData: { disableActivePlayerCheck: true },
    staticHelper: {
      text: `<p>Игрок <b>${buyer.userName || 'Покупатель'}</b> предлагает купить ресурс: <b>${resourceLabel}</b>.</p>${sumLine}<p><b>Условия сделки:</b> ${paymentRu}.</p><p>Согласны продать на этих условиях?</p>`,
      buttons: [
        { text: 'Согласиться', workerDealRespond: 'accept' },
        { text: 'Отказаться', workerDealRespond: 'decline', exit: true },
      ],
    },
  });

  buyer.set({
    staticHelper: {
      text: `<p>Вы предложили купить: <b>${resourceLabel}</b> за <b>${dealAmount}</b>.</p><p><b>Условия:</b> ${paymentRu}.</p><p>Ожидайте ответа оппонента.</p>`,
    },
    eventData: { workerDealPickUI: null },
  });

  if (storeUser) {
    storeUser.set({
      workerDealPickUI: null,
      workerDealSession: lib.utils.structuredClone(nextSession),
    });
    await storeUser.saveChanges();
  }

  const paymentLabel = payment === 'deferred' ? 'с отсрочкой оплаты' : 'с оплатой сразу';
  game.logs({
    msg: `Игрок {{player}} предложил сделку по ресурсу (${paymentLabel}), сумма ${dealAmount}.`,
    userId: buyer.userId,
  });
});
