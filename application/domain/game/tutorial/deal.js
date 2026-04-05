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
        { text: 'Одолжить денег', step: 'borrowMoney', key: null },
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
      input: [{ placeholder: 'Сумма', name: 'amount' }],
      actions: {
        TRIGGER: async ({ $helper, inputData, clickedButton }) => {
          const amount = Number(inputData.amount);
          if (inputData.amount === '' || !Number.isFinite(amount)) {
            $helper.dialogError = 'Необходимо указать сумму сделки';
            return { preventApiCall: true };
          }

          const eventData = { ...clickedButton, amount };
          await api.action
            .call({ path: 'game.api.action', args: [{ name: 'eventTrigger', data: { eventData } }] })
            .catch(prettyAlert);

          return { exit: true };
        },
      },
      buttons: [
        { text: 'Назад', step: 'choose', key: null },
        { text: 'Отправить запрос', action: 'TRIGGER', dealType: 'borrowMoney' },
        { text: 'Закрыть', action: 'exit', exit: true },
      ],
    },
    buyResource: {
      superPos: true,
      bigControls: true,
      text: `<p>Укажи <b>сумму сделки</b> и способ оплаты, затем нажми кнопку с нужным <b>ресурсом</b> — условия применятся, и пойдёт предложение сделки.</p>`,
      input: [
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
      ],
      prepare({ step, user }) {
        const game = lib.store('game').get(user.gameId);
        const player = game.get(user.playerId);

        step.buttons = [
          { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
          ...Object.entries(player.eventData.deal.resources).map(([group, { title: text }]) => {
            return { group, text, action: 'TRIGGER', dealType: 'buyResource' };
          }),
          { text: 'Отменить сделку', action: 'RESET', exit: true },
        ];
      },
      actions: {
        TRIGGER: async ({ $helper, inputData, clickedButton }) => {
          const amount = Number(inputData.amount);
          if (inputData.amount === '' || !Number.isFinite(amount)) {
            $helper.dialogError = 'Необходимо указать сумму сделки';
            return { preventApiCall: true };
          }

          const eventData = {
            dealType: clickedButton.dealType,
            amount,
            payType: inputData.payType,
            group: clickedButton.group,
          };
          await api.action
            .call({ path: 'game.api.action', args: [{ name: 'eventTrigger', data: { eventData } }] })
            .catch(prettyAlert);

          return { exit: true };
        },
        RESET: async ({ $helper }) => {
          await api.action.call({ path: 'game.api.action', args: [{ name: 'eventReset' }] }).catch(prettyAlert);

          return { exit: true };
        },
      },
      buttons: [],
    },
    useService: {
      superPos: true,
      bigControls: true,
      text: `
        Воспользоваться услугой оппонента — например, эффект его карты компании или особое действие. Условия зависят от ситуации на поле и правил карты.
      `,
      input: [
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
      ],
      prepare({ step, user }) {
        const game = lib.store('game').get(user.gameId);
        const player = game.get(user.playerId);

        step.buttons = [
          { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
          ...Object.entries(player.eventData.deal.companies).map(([group, { title: text }]) => {
            return { group, text, action: 'TRIGGER', dealType: 'useService' };
          }),
          { text: 'Отменить сделку', action: 'RESET', exit: true },
        ];
      },
      actions: {
        TRIGGER: async ({ $helper, inputData, clickedButton }) => {
          const amount = Number(inputData.amount);
          if (inputData.amount === '' || !Number.isFinite(amount)) {
            $helper.dialogError = 'Необходимо указать сумму сделки';
            return { preventApiCall: true };
          }

          const eventData = {
            dealType: clickedButton.dealType,
            amount,
            payType: inputData.payType,
            group: clickedButton.group,
          };
          await api.action
            .call({ path: 'game.api.action', args: [{ name: 'eventTrigger', data: { eventData } }] })
            .catch(prettyAlert);

          return { exit: true };
        },
        RESET: async ({ $helper }) => {
          await api.action.call({ path: 'game.api.action', args: [{ name: 'eventReset' }] }).catch(prettyAlert);

          return { exit: true };
        },
      },
      buttons: [
        { text: 'Назад', step: 'choose' },
        { text: 'Закрыть', action: 'exit', exit: true },
      ],
    },
  },
});
