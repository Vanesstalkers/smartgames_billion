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
        const game = lib.store('game').get(user.gameId);
        const player = game.get(user.playerId);
        const seller = game.get(player.eventData.dealSellerId);

        const resourceButtons = [];
        for (const card of domain.game.configs.cards({ unique: true })) {
          const chip = seller.getChipBySubtype(card.group || card.name);
          if (!chip) continue;
          resourceButtons.push({
            text: card.title,
            action: 'submitDealAmount',
            step: 'buyResource',
            chipId: chip.id(),
          });
        }

        step.text = `<p>Укажи <b>сумму сделки</b> и способ оплаты, затем нажми кнопку с нужным <b>ресурсом</b> — условия применятся, и пойдёт предложение сделки.</p>`;
        step.input = [
          { placeholder: 'Сумма сделки', name: 'amount' },
          {
            type: 'select',
            name: 'payType',
            value: 'immediate',
            options: [
              { value: 'immediate', label: 'Оплата сразу' },
              { value: 'deferred', label: 'В долг' },
            ],
          },
        ];
        step.buttons = [
          { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'] },
          ...resourceButtons,
          { text: 'Отменить сделку', action: 'workerDealCancelDeal', exit: true },
        ];
      },
      actions: {
        submitDealAmount: async ({ $helper, inputData, clickedButton }) => {
          const amount = Number(inputData.amount);
          if (inputData.amount === '' || !Number.isFinite(amount)) {
            $helper.dialogError = 'Необходимо указать сумму сделки';
            return;
          }

          const eventData = { amount, payType: inputData.payType, chipId: clickedButton.chipId };
          await api.action
            .call({ path: 'game.api.action', args: [{ name: 'eventTrigger', data: { eventData } }] })
            .catch(prettyAlert);

          return { exit: true };
        },
        workerDealCancelDeal: async () => {
          await api.action.call({ path: 'game.api.action', args: [{ name: 'eventReset' }] }).catch(prettyAlert);
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
