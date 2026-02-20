const { Model, DataTypes } = require('sequelize');

class HorarioFuncionamento extends Model {
  static init(sequelize) {
    super.init(
      {
        usuario_id: DataTypes.INTEGER,
        dia_semana: DataTypes.INTEGER,
        hora_inicio: DataTypes.TIME,
        intervalo_inicio: DataTypes.TIME,
        intervalo_fim: DataTypes.TIME,
        hora_fim: DataTypes.TIME,
        intervalo_atendimento: DataTypes.INTEGER,
        ativo: DataTypes.BOOLEAN
      },
      {
        sequelize,
        tableName: 'horario_funcionamento',
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

module.exports = HorarioFuncionamento;
