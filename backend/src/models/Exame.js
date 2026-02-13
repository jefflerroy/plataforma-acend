const { Model, DataTypes } = require('sequelize');

class Exame extends Model {
  static init(sequelize) {
    super.init(
      {
        paciente_id: DataTypes.INTEGER,
        tipo: DataTypes.STRING,
        nome_original: DataTypes.STRING,
        nome_armazenado: DataTypes.STRING,
        caminho: DataTypes.STRING,
        mime_type: DataTypes.STRING,
        tamanho_bytes: DataTypes.INTEGER,
        hash_sha256: DataTypes.STRING,

        created_at: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
        updated_at: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
      },
      {
        sequelize,
        tableName: 'exame',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'paciente_id', as: 'paciente' });
  }
}

module.exports = Exame;
