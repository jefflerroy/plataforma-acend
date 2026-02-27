const { Model, DataTypes } = require('sequelize');

class Refeicao extends Model {
  static init(sequelize) {
    super.init(
      {
        dieta_id: DataTypes.INTEGER,
        horario: DataTypes.STRING,
        refeicao: DataTypes.STRING,
        descricao: DataTypes.TEXT,
      },
      {
        sequelize,
        tableName: 'refeicao',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Dieta, { foreignKey: 'dieta_id', as: 'dieta' });
  }
}

module.exports = Refeicao;