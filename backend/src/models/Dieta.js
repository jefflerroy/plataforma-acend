const { Model, DataTypes } = require('sequelize');

class Dieta extends Model {
  static init(sequelize) {
    super.init(
      {
        titulo: DataTypes.STRING,
        observacao: DataTypes.TEXT
      },
      {
        sequelize,
        tableName: 'dieta',
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Refeicao, { foreignKey: 'dieta_id', as: 'refeicoes' });
    this.hasMany(models.DietaUsuario, { foreignKey: 'dieta_id', as: 'dietasUsuarios' });
  }
}

module.exports = Dieta;