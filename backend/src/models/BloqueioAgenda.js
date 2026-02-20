const { Model, DataTypes } = require('sequelize');

class BloqueioAgenda extends Model {
  static init(sequelize) {
    super.init(
      {
        usuario_id: DataTypes.INTEGER,
        data_inicio: DataTypes.DATE,
        data_fim: DataTypes.DATE,
        motivo: DataTypes.STRING
      },
      {
        sequelize,
        tableName: 'bloqueio_agenda',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
  }
}

module.exports = BloqueioAgenda;
