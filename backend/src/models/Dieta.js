const { Model, DataTypes } = require('sequelize');

class Dieta extends Model {
  static init(sequelize) {
    super.init(
      {
        titulo: DataTypes.STRING,
        observacao: DataTypes.STRING,

        created_at: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
        updated_at: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
      },
      {
        sequelize,
        tableName: 'dieta',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Refeicao, { foreignKey: 'dieta_id', as: 'refeicoes' });
    this.hasMany(models.DietaUsuario, { foreignKey: 'dieta_id', as: 'dietasUsuarios' });
  }
}

module.exports = Dieta;
