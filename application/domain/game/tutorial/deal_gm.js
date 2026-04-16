/* eslint-disable max-len */
() => {

  const triggerAction = async ({ $helper, inputData, clickedButton }) => {
    const amount = Number(inputData.amount);
    if (inputData.amount === '' || !Number.isFinite(amount)) {
      $helper.dialogError = 'Необходимо заполнить все поля';
      return { preventApiCall: true };
    }

    const eventData = { ...clickedButton, amount };
    await api.action
      .call({ path: 'game.api.action', args: [{ name: 'eventTrigger', data: { eventData } }] })
      .catch(prettyAlert);

    return { exit: true };
  };

  return {
    steps: {
      choose: {
        initialStep: true,
        superPos: true,
        bigControls: true,
        text: `
        Действия с игроком: выбери, что хочешь сделать.
      `,
        buttons: [
          { text: 'Добавить деньги', step: 'addMoney', key: null },
          { text: 'Удалить деньги', step: 'removeMoney', key: null },
          { text: 'Установить доход', step: 'setIncome', key: null },
          { text: 'Выход из меню', action: 'RESET', exit: true },
        ],
        actions: {
          RESET: async () => {
            await api.action.call({ path: 'game.api.action', args: [{ name: 'eventReset' }] }).catch(prettyAlert);
            return { exit: true };
          },
        },
      },
      addMoney: {
        superPos: true,
        bigControls: true,
        text: `Укажи сумму, которую хочешь добавить`,
        input: [{ placeholder: 'Сумма', name: 'amount' }],
        buttons: [
          { text: 'Назад', step: 'choose', key: null },
          { text: 'Подтвердить', action: 'TRIGGER', dealType: 'addMoney' },
          { text: 'Закрыть', action: 'exit', exit: true },
        ],
        actions: {
          TRIGGER: triggerAction,
        },
      },
      removeMoney: {
        superPos: true,
        bigControls: true,
        text: `Укажи сумму, которую хочешь убрать`,
        input: [{ placeholder: 'Сумма', name: 'amount' }],
        buttons: [
          { text: 'Назад', step: 'choose', key: null },
          { text: 'Подтвердить', action: 'TRIGGER', dealType: 'removeMoney' },
          { text: 'Закрыть', action: 'exit', exit: true },
        ],
        actions: {
          TRIGGER: triggerAction,
        },
      },
      setIncome: {
        superPos: true,
        bigControls: true,
        text: `Укажи значение дохода, которое хочешь установить`,
        input: [{ placeholder: 'Доход', name: 'amount' }],
        buttons: [
          { text: 'Назад', step: 'choose', key: null },
          { text: 'Подтвердить', action: 'TRIGGER', dealType: 'setIncome' },
          { text: 'Закрыть', action: 'exit', exit: true },
        ],
        actions: {
          TRIGGER: triggerAction,
        }
      },
    },
  };
};
