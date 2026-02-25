const { Model, DataTypes } = require('sequelize');

class Chat extends Model {
  static init(sequelize) {
    super.init(
      {
        paciente_id: DataTypes.INTEGER,
        mensagem: DataTypes.TEXT,
        resposta_ia: DataTypes.BOOLEAN,
      },
      {
        sequelize,
        tableName: 'chat',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'paciente_id', as: 'paciente' });
  }
}

module.exports = Chat;