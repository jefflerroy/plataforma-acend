const { Model, DataTypes } = require('sequelize');

class Evolucao extends Model {
  static init(sequelize) {
    super.init(
      {
        paciente_id: DataTypes.INTEGER,
        peso: DataTypes.DECIMAL(5, 2),
        massa_muscular: DataTypes.DECIMAL(5, 2),
        massa_gordura: DataTypes.DECIMAL(5, 2),
        percentual_gordura: DataTypes.DECIMAL(5, 2),
        imc: DataTypes.DECIMAL(5, 2),
      },
      {
        sequelize,
        tableName: 'evolucao',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'paciente_id', as: 'paciente' });
  }
}

module.exports = Evolucao;