/* eslint-disable max-len */
() => ({
  steps: {
    choose: {
      initialStep: true,
      superPos: true,
      bigControls: true,
      text: `
        Действия с оппонентом: выбери, что хочешь сделать.
      `,
      buttons: [
        { text: 'Одолжить денег', step: 'borrowMoney' },
        { text: 'Купить ресурс', step: 'buyResource' },
        { text: 'Воспользоваться услугой', step: 'useService' },
        { text: 'Отмена', action: 'exit', exit: true },
      ],
    },
    borrowMoney: {
      superPos: true,
      text: `
        Одолжить деньги — отдельные правила займа появятся в партии. Сделку с ресурсом и суммой можно оформить через пункт «Купить ресурс»: сумма и выбор ресурса — в одном окне подсказки.
      `,
      buttons: [
        { text: 'Назад', step: 'choose' },
        { text: 'Закрыть', action: 'exit', exit: true },
      ],
    },
    buyResource: {
      superPos: true,
      bigControls: true,
      text: '',
      input: null,
      prepare({ step, user }) {
        const game = user.gameId ? lib.store('game').get(user.gameId) : null;
        const pl = game && user.playerId ? game.get(user.playerId) : null;
        const ui = user.workerDealPickUI || pl?.eventData?.workerDealPickUI;

        if (ui?.pickButtons?.length) {
          step.text = `<p>Укажи <b>сумму сделки</b> и способ оплаты, затем нажми кнопку с нужным <b>ресурсом</b> — условия применятся, и пойдёт предложение сделки.</p>`;
          step.input = [
            { placeholder: 'Сумма сделки', name: 'amount', value: String(ui.amount) },
            {
              type: 'select',
              name: 'payment',
              value: 'immediate',
              options: [
                { value: 'immediate', label: 'Оплата сразу' },
                { value: 'deferred', label: 'В долг' },
              ],
            },
          ];
          step.buttons = [
            { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'] },
            ...ui.pickButtons.map((b) => ({
              text: b.text,
              action: 'submitDealAmount',
              step: 'buyResource',
              pickChipId: b.workerDealPickChip,
              key: null,
            })),
            { text: 'Отменить сделку', action: 'workerDealCancelDeal', exit: true },
          ];
          return;
        }

        step.text = user.workerDealSellerPlayerId
          ? `<p>Не удалось показать ресурсы оппонента — возможно, у него нет фишек в отраслевой колоде.</p>`
          : `<p>Чтобы выбрать ресурс и сумму здесь, открой это действие с <b>карточки оппонента</b> (иконка рукопожатия).</p>`;
        step.input = null;
        step.buttons = [
          { text: 'Назад', step: 'choose' },
          { text: 'Закрыть', action: 'exit', exit: true },
        ];
      },
      actions: {
        submitDealAmount: async ({ inputData, state, clickedButton }) => {
          const raw = String(inputData.amount ?? '').trim().replace(',', '.');
          const amount = raw === '' ? NaN : Number(raw);
          if (!Number.isFinite(amount) || amount <= 0) {
            prettyAlert({ message: 'Введите корректную положительную сумму.' });
            return { exit: true };
          }
          const sellerPlayerId =
            state.workerDealSellerPlayerId || state.store?.user?.[state.currentUser]?.workerDealSellerPlayerId;
          if (!sellerPlayerId) {
            prettyAlert({ message: 'Сначала открой это действие с карточки оппонента (иконка рукопожатия).' });
            return { exit: true };
          }
          try {
            await api.action.call({ path: 'game.api.action', args: [{ name: 'workerDealAbortPick' }] }).catch(() => {});
            await api.action.call({
              path: 'game.api.action',
              args: [{ name: 'workerDealStartPick', data: { sellerPlayerId, amount } }],
            });
          } catch (err) {
            prettyAlert(err);
            return { exit: true };
          }
          const chipId = clickedButton?.pickChipId;
          const pay = inputData.payment;
          const payment = pay === 'deferred' || pay === 'immediate' ? pay : 'immediate';
          if (!chipId) {
            prettyAlert({ message: 'Не выбран ресурс.' });
            return { exit: true };
          }
          try {
            await api.action.call({
              path: 'game.api.action',
              args: [{ name: 'workerDealPickChip', data: { chipId, payment } }],
            });
          } catch (e) {
            prettyAlert(e);
            return { exit: true };
          }
          return { exit: true };
        },
        workerDealCancelDeal: async () => {
          await api.action.call({ path: 'game.api.action', args: [{ name: 'workerDealAbortPick' }] }).catch(prettyAlert);
          return { exit: true };
        },
      },
      buttons: [],
    },
    useService: {
      superPos: true,
      text: `
        Воспользоваться услугой оппонента — например, эффект его карты компании или особое действие. Условия зависят от ситуации на поле и правил карты.
      `,
      buttons: [
        { text: 'Назад', step: 'choose' },
        { text: 'Закрыть', action: 'exit', exit: true },
      ],
    },
  },
});
