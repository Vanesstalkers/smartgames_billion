(class Player extends lib.game._objects.Player {
  constructor(data, { parent }) {
    super(data, { parent });
    this.broadcastableFields(
      //
      this.broadcastableFields().concat(['income', 'money'])
    );

    this.set({ money: data.money || 0, income: data.income || 6 });
  }
});
