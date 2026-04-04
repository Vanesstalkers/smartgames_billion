(class Player extends lib.game._objects.Player {
  dealsMap = {};

  constructor(data, { parent }) {
    super(data, { parent });
    this.broadcastableFields(
      //
      this.broadcastableFields().concat(['income', 'money'])
    );

    this.set({ money: data.money || 0, income: data.income || 6 });
  }

  getChipBySubtype(subtype) {
    const industry = this.decks?.industry;
    if (!industry) return null;
    for (const company of industry.items() || []) {
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
  earnMoney(amount) {
    this.set({ money: this.money + amount });

    const deal = this.deals().filter((deal) => deal.sellerId)[0];
    if (deal) {
      const seller = this.game().get(deal.sellerId);
      this.set({
        staticHelper: {
          text: `Заключенные сделки:`,
          showList: [
            {
              title: `Оплатить долг <a>${deal.amount}₽₽₽</a> игроку <a>${seller.userName}</a>`,
              action: { code: 'CLOSE_DEAL', dealId: deal.dealId },
            },
          ],
          buttons: [{ text: 'Отмена' }],
        },
      });
    }
  }
  deals() {
    return Object.values(this.dealsMap);
  }
});
