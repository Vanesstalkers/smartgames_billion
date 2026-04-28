(function () {
  const showList = [];
  const deals = this.deals();
  for (const deal of deals.filter((d) => d.debt)) {
    const contractor = this.game().get(deal.contractorId);
    showList.push({
      title: `Оплатить долг <a>${deal.amount}₽</a> игроку <a>${contractor.getUserName()}</a>`,
      action: { code: 'CLOSE_DEAL', dealId: deal.dealId },
    });
  }

  for (const deal of deals.filter((d) => !d.debt)) {
    const contractor = this.game().get(deal.contractorId);
    showList.push({
      title: `Долг <a>${deal.amount}₽</a> игрока <a>${contractor.getUserName()}</a>`,
    });
  }

  if (showList.length === 0) {
    this.set({
      staticHelper: { text: `Активных сделок в настоящий момент нет`, buttons: [{ text: 'Спасибо' }] },
    });
    return;
  }

  this.set({
    staticHelper: { text: `Заключенные сделки:`, showList, buttons: [{ text: 'Отмена' }] },
  });
});
