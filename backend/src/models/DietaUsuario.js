const { Model, DataTypes } = require('sequelize');

class DietaUsuario extends Model {
  static init(sequelize) {
    super.init(
      {
        paciente_id: DataTypes.INTEGER,
        dieta_id: DataTypes.INTEGER
      },
      {
        sequelize,
        tableName: 'dieta_usuario',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'paciente_id', as: 'paciente' });
    this.belongsTo(models.Dieta, { foreignKey: 'dieta_id', as: 'dieta' });
  }
}

module.exports = DietaUsuario;
