const { Model, DataTypes } = require('sequelize');

class Agendamento extends Model {
  static init(sequelize) {
    super.init(
      {
        paciente_id: DataTypes.INTEGER,
        profissional_id: DataTypes.INTEGER,
        tipo: DataTypes.STRING,
        status: DataTypes.STRING,
        data: DataTypes.DATEONLY,
        hora: DataTypes.TIME,
        local: DataTypes.STRING,
        observacao: DataTypes.TEXT,

        created_at: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
        updated_at: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
      },
      {
        sequelize,
        tableName: 'agendamento',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'paciente_id', as: 'paciente' });
    this.belongsTo(models.Usuario, { foreignKey: 'profissional_id', as: 'profissional' });
  }
}

module.exports = Agendamento;
