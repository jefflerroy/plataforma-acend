const { Model, DataTypes } = require('sequelize');

class Refeicao extends Model {
  static init(sequelize) {
    super.init(
      {
        dieta_id: DataTypes.INTEGER,
        horario: DataTypes.STRING,
        refeicao: DataTypes.STRING,
        descricao: DataTypes.STRING,
        proteinas: DataTypes.INTEGER,
        carboidratos: DataTypes.INTEGER,
        gorduras: DataTypes.INTEGER,
        calorias: DataTypes.INTEGER,

        created_at: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
        updated_at: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
      },
      {
        sequelize,
        tableName: 'refeicao',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Dieta, { foreignKey: 'dieta_id', as: 'dieta' });
  }
}

module.exports = Refeicao;
