/* eslint-disable max-len */
() => {
  const borrowMoneyStepActions = {
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
  };

  const borrowMoneyStepBodies = {
    money: `
        Одолжить деньги — отдельные правила займа появятся в партии. Сделку с ресурсом и суммой можно оформить через пункт «Купить ресурс»: сумма и выбор ресурса — в одном окне подсказки.
        <p>Возврат по этому запросу — <b>деньгами</b>.</p>
      `,
    booster: `
        Одолжить деньги — отдельные правила займа появятся в партии. Сделку с ресурсом и суммой можно оформить через пункт «Купить ресурс»: сумма и выбор ресурса — в одном окне подсказки.
        <p>Возврат по этому запросу — <b>бустером</b>.</p>
      `,
  };

  const makeBorrowMoneyStep = (repayType) => ({
    superPos: true,
    text: borrowMoneyStepBodies[repayType],
    input: [{ placeholder: 'Сумма', name: 'amount' }],
    actions: borrowMoneyStepActions,
    prepare({ step }) {
      step.buttons = [
        { text: 'Назад', step: 'borrowRepayChoice', key: null },
        { text: 'Отправить запрос', action: 'TRIGGER', dealType: 'borrowMoney', repayType },
        { text: 'Закрыть', action: 'exit', exit: true },
      ];
    },
    buttons: [],
  });

  return {
    steps: {
      choose: {
        initialStep: true,
        superPos: true,
        bigControls: true,
        text: `
        Действия с оппонентом: выбери, что хочешь сделать.
      `,
        buttons: [
          { text: 'Одолжить денег', step: 'borrowRepayChoice', key: null },
          { text: 'Купить ресурс', step: 'buyResource' },
          { text: 'Воспользоваться услугой', step: 'useService' },
          { text: 'Отмена', action: 'exit', exit: true },
        ],
      },
      borrowRepayChoice: {
        superPos: true,
        bigControls: true,
        text: `
        Как планируешь вернуть одолженные средства?
      `,
        buttons: [
          { text: 'Вернуть деньгами', step: 'borrowMoney_money', key: null },
          { text: 'Вернуть ресурсом', step: 'borrowMoney_resource', key: null },
          { text: 'Вернуть услугой', step: 'borrowMoney_service', key: null },
          { text: 'Вернуть бустером', step: 'borrowMoney_booster', key: null },
          { text: 'Назад', step: 'choose', key: null },
          { text: 'Отмена', action: 'exit', exit: true },
        ],
      },
      borrowMoney_money: makeBorrowMoneyStep('money'),
      borrowMoney_resource: {
        superPos: true,
        bigControls: true,
        text: `<p>Укажи <b>сумму займа</b>, затем нажми кнопку с <b>ресурсом с твоего поля</b>, которым планируешь вернуть долг — как при покупке ресурса у оппонента, но список из <b>твоих</b> свободных фишек. Отправится предложение сделки.</p>
        <p>Возврат по этому запросу — <b>ресурсом</b>.</p>`,
        input: [{ placeholder: 'Сумма', name: 'amount' }],
        prepare({ step, user }) {
          const game = lib.store('game').get(user.gameId);
          const player = game.get(user.playerId);
          const playerResources = player.eventData.deal.playerResources || {};
          const entries = Object.entries(playerResources);

          if (entries.length === 0) {
            step.text = `<p>У тебя сейчас нет свободных ресурсов на поле для такого условия возврата. Выбери другой способ или договорись позже.</p>`;
            step.buttons = [
              { text: 'Назад', step: 'borrowRepayChoice', icon: ['fas', 'arrow-left'], key: null },
              { text: 'Закрыть', action: 'exit', exit: true },
            ];
            return;
          }

          step.buttons = [
            { text: 'Назад', step: 'borrowRepayChoice', icon: ['fas', 'arrow-left'], key: null },
            ...entries.map(([group, { title }]) => ({
              group,
              text: `Вернуть ресурсом: ${title}`,
              action: 'TRIGGER',
              dealType: 'borrowMoney',
              repayType: 'resource',
            })),
            { text: 'Отменить сделку', action: 'RESET', exit: true },
          ];
        },
        actions: {
          ...borrowMoneyStepActions,
          RESET: async () => {
            await api.action.call({ path: 'game.api.action', args: [{ name: 'eventReset' }] }).catch(prettyAlert);
            return { exit: true };
          },
        },
        buttons: [],
      },
      borrowMoney_service: {
        superPos: true,
        bigControls: true,
        text: `<p>Укажи <b>сумму займа</b>, затем выбери <b>услугу с твоей карты компании</b>, которой планируешь вернуть долг — список из <b>твоих</b> карт компаний на поле (не разыгранных). Отправится предложение сделки.</p>
        <p>Возврат по этому запросу — <b>услугой</b>.</p>`,
        input: [{ placeholder: 'Сумма', name: 'amount' }],
        prepare({ step, user }) {
          const game = lib.store('game').get(user.gameId);
          const player = game.get(user.playerId);
          const playerCompanies = player.eventData.deal.playerCompanies || {};
          const entries = Object.entries(playerCompanies);

          if (entries.length === 0) {
            step.text = `<p>У тебя сейчас нет подходящих карт компаний на поле для такого условия возврата. Выбери другой способ или договорись позже.</p>`;
            step.buttons = [
              { text: 'Назад', step: 'borrowRepayChoice', icon: ['fas', 'arrow-left'], key: null },
              { text: 'Закрыть', action: 'exit', exit: true },
            ];
            return;
          }

          step.buttons = [
            { text: 'Назад', step: 'borrowRepayChoice', icon: ['fas', 'arrow-left'], key: null },
            ...entries.map(([group, { title }]) => ({
              group,
              text: `Вернуть услугой: ${title}`,
              action: 'TRIGGER',
              dealType: 'borrowMoney',
              repayType: 'service',
            })),
            { text: 'Отменить сделку', action: 'RESET', exit: true },
          ];
        },
        actions: {
          ...borrowMoneyStepActions,
          RESET: async () => {
            await api.action.call({ path: 'game.api.action', args: [{ name: 'eventReset' }] }).catch(prettyAlert);
            return { exit: true };
          },
        },
        buttons: [],
      },
      borrowMoney_booster: makeBorrowMoneyStep('booster'),
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
            ...Object.entries(player.eventData.deal.contractorResources).map(([group, { title: text }]) => {
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
            ...Object.entries(player.eventData.deal.contractorCompanies).map(([group, { title: text }]) => {
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
  };
};
