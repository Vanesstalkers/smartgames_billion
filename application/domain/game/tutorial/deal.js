/* eslint-disable max-len */
() => {
  const defaultActions = {
    TRIGGER: async ({ $helper, inputData, clickedButton }) => {
      const amount = Number(inputData.amount);
      if (inputData.amount === '' || !Number.isFinite(amount)) {
        $helper.dialogError = 'Необходимо указать сумму сделки';
        return { preventApiCall: true };
      }

      const eventData = { ...clickedButton, amount, code: inputData.code, payType: inputData.payType };
      await api.action
        .call({ path: 'game.api.action', args: [{ name: 'eventTrigger', data: { eventData } }] })
        .catch(prettyAlert);

      return { exit: true };
    },
    RESET: async () => {
      await api.action.call({ path: 'game.api.action', args: [{ name: 'eventReset' }] }).catch(prettyAlert);
      return { exit: true };
    },
  };

  const payTypeSelect = {
    type: 'select',
    name: 'payType',
    value: 'immediate',
    options: [
      { value: 'immediate', label: 'Оплата сразу' },
      { value: 'deferred', label: 'В долг' },
    ],
  };

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
          { text: 'Купить у игрока ресурс', step: 'buyResource', key: null },
          { text: 'Использовать услугу игрока', step: 'useService', key: null },
          { text: 'Взять деньги в долг', step: 'borrowMoney', key: null },
          { text: 'Продать игроку ресурс', step: 'saleResource', key: null },
          { text: 'Продать игроку услугу', step: 'saleService', key: null },
          { text: 'Продать игроку бустер', step: 'saleBuster', key: null },
          { text: 'Отмена', action: 'RESET', exit: true },
        ],
        actions: {
          RESET: defaultActions['RESET'],
        },
      },
      borrowMoney: {
        superPos: true,
        text: 'Одолжить деньги в размере',
        input: [{ placeholder: 'Сумма', name: 'amount' }],
        actions: defaultActions,
        buttons: [
          { text: 'Назад', step: 'choose', key: null },
          { text: 'Предложить сделку', action: 'TRIGGER', dealType: 'borrowMoney' },
          { text: 'Закрыть', action: 'RESET', exit: true },
        ],
      },
      saleResource: {
        superPos: true,
        bigControls: true,
        text: `Укажите параметры сделки`,
        input: [{ placeholder: 'Сумма', name: 'amount' }, payTypeSelect],
        prepare({ step, user }) {
          const game = lib.store('game').get(user.gameId);
          const player = game.get(user.playerId);
          const playerResources = player.eventData.deal.playerResources || {};
          const entries = Object.entries(playerResources);

          if (entries.length === 0) {
            step.text = `У тебя нет подходящих для сделки ресурсов`;
            step.buttons = [
              { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
              { text: 'Закрыть', action: 'RESET', exit: true },
            ];
            return;
          }

          step.input.push({
            label: 'Предлагаемый ресурс:',
            type: 'select',
            name: 'code',
            value: entries[0][0],
            options: entries.map(([group, { title }]) => ({ value: group, label: title })),
          });

          step.buttons = [
            { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
            { text: 'Предложить сделку', action: 'TRIGGER', dealType: 'saleResource' },
            { text: 'Закрыть', action: 'RESET', exit: true },
          ];
        },
        actions: defaultActions,
        buttons: [],
      },
      saleService: {
        superPos: true,
        bigControls: true,
        text: `Укажите параметры сделки`,
        input: [{ placeholder: 'Сумма', name: 'amount' }, payTypeSelect],
        prepare({ step, user }) {
          const game = lib.store('game').get(user.gameId);
          const player = game.get(user.playerId);
          const playerCompanies = player.eventData.deal.playerCompanies || {};
          const entries = Object.entries(playerCompanies);

          if (entries.length === 0) {
            step.input = [];
            step.text = `У тебя нет подходящих для сделки предприятий`;
            step.buttons = [
              { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
              { text: 'Закрыть', action: 'RESET', exit: true },
            ];
            return;
          }

          step.input.push({
            label: 'Предлагаемая услуга:',
            type: 'select',
            name: 'code',
            value: entries[0][0],
            options: entries.map(([group, { title }]) => ({ value: group, label: title })),
          });

          step.buttons = [
            { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
            { text: 'Предложить сделку', action: 'TRIGGER', dealType: 'saleService' },
            { text: 'Закрыть', action: 'RESET', exit: true },
          ];
        },
        actions: defaultActions,
        buttons: [],
      },
      saleBuster: {
        superPos: true,
        text: 'Укажите параметры сделки',
        input: [{ placeholder: 'Сумма', name: 'amount' }, payTypeSelect],
        actions: defaultActions,
        prepare({ step, user }) {
          const game = lib.store('game').get(user.gameId);
          const player = game.get(user.playerId);
          const playerBusters = player.eventData.deal.playerBusters || {};
          const entries = Object.entries(playerBusters);

          if (entries.length === 0) {
            step.input = [];
            step.text = `У тебя нет подходящих для сделки бустеров`;
            step.buttons = [
              { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
              { text: 'Закрыть', action: 'RESET', exit: true },
            ];
            return;
          }

          step.input.push({
            label: 'Предлагаемый бустер:',
            type: 'select',
            name: 'code',
            value: entries[0][0],
            options: entries.map(([name, { title }]) => ({ value: name, label: title })),
          });

          step.buttons = [
            { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
            { text: 'Предложить сделку', action: 'TRIGGER', dealType: 'saleBuster' },
            { text: 'Закрыть', action: 'RESET', exit: true },
          ];
        },
        buttons: [],
      },
      buyResource: {
        superPos: true,
        bigControls: true,
        text: `Укажите параметры сделки`,
        input: [{ placeholder: 'Сумма сделки', name: 'amount' }, payTypeSelect],
        prepare({ step, user }) {
          const game = lib.store('game').get(user.gameId);
          const player = game.get(user.playerId);
          const contractorResources = player.eventData.deal.contractorResources || {};
          const entries = Object.entries(contractorResources);

          if (entries.length === 0) {
            step.input = [];
            step.text = `У игрока нет подходящих для сделки ресурсов`;
            return;
          }

          step.input.push({
            label: 'Необходимый ресурс:',
            type: 'select',
            name: 'code',
            value: entries[0][0],
            options: entries.map(([group, { title }]) => ({ value: group, label: title })),
          });

          step.buttons = [
            { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
            { text: 'Предложить сделку', action: 'TRIGGER', dealType: 'buyResource' },
            { text: 'Отменить сделку', action: 'RESET', exit: true },
          ];
        },
        actions: defaultActions,
        buttons: [],
      },
      useService: {
        superPos: true,
        bigControls: true,
        text: `Укажите параметры сделки`,
        input: [{ placeholder: 'Сумма сделки', name: 'amount' }, payTypeSelect],
        prepare({ step, user }) {
          const game = lib.store('game').get(user.gameId);
          const player = game.get(user.playerId);
          const contractorCompanies = player.eventData.deal.contractorCompanies || {};
          const entries = Object.entries(contractorCompanies);

          if (entries.length === 0) {
            step.input = [];
            step.text = `У игрока нет подходящих для сделки предприятий`;
          }

          step.input.push({
            label: 'Необходимая услуга:',
            type: 'select',
            name: 'code',
            value: entries[0][0],
            options: entries.map(([group, { title }]) => ({ value: group, label: title })),
          });

          step.buttons = [
            { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
            { text: 'Предложить сделку', action: 'TRIGGER', dealType: 'useService' },
            { text: 'Отменить сделку', action: 'RESET', exit: true },
          ];
        },
        actions: defaultActions,
        buttons: [
          { text: 'Назад', step: 'choose', icon: ['fas', 'arrow-left'], key: null },
          { text: 'Закрыть', action: 'RESET', exit: true },
        ],
      },
    },
  };
};
