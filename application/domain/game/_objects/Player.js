(class Player extends lib.game._objects.Player {
  dealsMap = {};

  constructor(data, { parent }) {
    super(data, { parent });
    this.broadcastableFields(['income', 'money']);

    const { money = 0, income = 0, acquired = {}, dealsMap = {} } = data;
    this.set({ money, income, acquired, dealsMap });
  }

  getCompaniesBySubtype({ type }) {
    return this.decks.company.items().filter((company) => company.subtype === type);
  }

  getBusters({ name } = {}) {
    let busterCards = this.decks.buster.items();
    if (name) busterCards = busterCards.filter((buster) => buster.name === name);
    return busterCards;
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

  getOuterDecksChips() {
    return this.decks.company
      .items()
      .map((company) => company.decks.outer.items()[0])
      .filter(Boolean);
  }

  earnMoney(amount) {
    this.set({ money: this.money + amount });
    this.showDealsHelper();
  }
  deals() {
    return Object.values(this.dealsMap);
  }
  showDealsHelper() {
    domain.game.actions.showDealsHelper.call(this);
  }

  processDistributionIncome() {
    const count = this.getCompaniesBySubtype({ type: 'distribution' }).length;
    if (count === 0) return;

    const income = count === 1 ? 3 : count === 2 ? 6 : 12;
    this.set({ money: this.money + income });

    this.game().logs({
      msg: `Игрок <a>{{player}}</a> получил дополнительный доход <a>${income}₽</a> от дистрибуции`,
      userId: this.userId,
    });
  }

  needRestoreResources() {
    for (const company of this.decks.company.items()) {
      if (company.needRestoreResources()) return true;
    }
    return false;
  }
  maxIncome() {
    const hasLightCompany = this.getCompaniesBySubtype({ type: 'light' }).length > 0;
    const companyCount = this.decks.company.itemsCount();
    return hasLightCompany ? 10 : companyCount == 1 ? 6 : companyCount == 2 ? 8 : 10;
  }
  updateIncome(income) {
    this.set({ income });

    if (income > 0 && this.eventData.bankrupt) {
      this.set(
        { eventData: { bankrupt: null, playDisabled: null, controlBtn: { label: 'Крутить рулетку' } } },
        { reset: ['eventData.controlBtn'] }
      );
    }
  }
});
