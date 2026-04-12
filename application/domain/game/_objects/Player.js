(class Player extends lib.game._objects.Player {
  dealsMap = {};

  constructor(data, { parent }) {
    super(data, { parent });
    this.broadcastableFields(['income', 'money']);

    const { money = 0, income = 0, acquired = {} } = data;
    this.set({ money, income, acquired });
  }

  companyCount({ type }) {
    return this.decks.company.items().filter((company) => company.subtype === type).length;
  }

  getAvailableChipsByValue(value) {
    const game = this.game();
    const result = [];

    for (const company of this.decks.company.items() || []) {
      const outerChip = company.decks.outer.items()[0];
      if (outerChip && outerChip.value === value) result.push(outerChip);
    }

    for (const company of this.decks.company.items() || []) {
      if (company.subtype !== value) continue;

      for (const chip of company.decks.inner.items() || []) {
        if (!chip.ownerId && chip.value === value) result.push(chip);
      }
    }
    for (const chipId of Object.keys(this.acquired?.chip || {})) {
      const chip = game.get(chipId);
      if (!chip) continue; // мог быть уже сыгран
      if (chip.value !== value) continue;
      result.push(chip);
    }

    return result;
  }

  getChipBySubtype(subtype, { ownedOnly = true } = {}) {
    for (const company of this.decks?.company.items() || []) {
      for (const deck of [company.decks?.outer, company.decks?.inner].filter(Boolean)) {
        for (const chip of deck.items() || []) {
          if (ownedOnly && chip.ownerId) continue;
          if (chip.value === subtype || chip.subtype === subtype) {
            return chip;
          }
        }
      }
    }
    for (const chipId of Object.keys(this.acquired?.chip || {})) {
      const chip = this.game().get(chipId);
      if (!chip) continue;
      if (chip.value !== subtype) continue;
      return chip;
    }
    return null;
  }
  earnMoney(amount) {
    this.set({ money: this.money + amount });
    this.showDealsHelper();
  }
  deals() {
    return Object.values(this.dealsMap);
  }
  showDealsHelper() {
    const showList = [];
    for (const deal of this.deals()) {
      if (!deal.playerDebt) continue;

      const contractor = this.game().get(deal.contractorId);
      showList.push({
        title: `Оплатить долг <a>${deal.amount}₽₽₽</a> игроку <a>${contractor.userName}</a>`,
        action: { code: 'CLOSE_DEAL', dealId: deal.dealId },
      });
    }
    if (showList.length === 0) return;

    this.set({
      staticHelper: { text: `Заключенные сделки:`, showList, buttons: [{ text: 'Отмена' }] },
    });
  }

  processDistributionIncome() {
    const count = this.companyCount({ type: 'distribution' });
    if (count === 0) return;

    const income = count === 1 ? 3 : count === 2 ? 6 : 12;
    this.set({ money: this.money + income });

    this.game().logs({
      msg: `Игрок <a>{{player}}</a> получил дополнительный доход <a>${income}₽</a> от дистрибуции`,
      userId: this.userId,
    });
  }
});
