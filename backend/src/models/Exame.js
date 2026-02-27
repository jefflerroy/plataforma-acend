const { Model, DataTypes } = require('sequelize');

class Exame extends Model {
  static init(sequelize) {
    super.init(
      {
        paciente_id: DataTypes.INTEGER,
        tipo: DataTypes.STRING,
        nome_original: DataTypes.STRING,
        url: DataTypes.STRING,
        mime: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: 'exame'
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'paciente_id', as: 'paciente' });
  }
}

module.exports = Exame;