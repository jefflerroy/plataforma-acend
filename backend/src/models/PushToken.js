const { Model, DataTypes } = require('sequelize');

class PushToken extends Model {
  static init(sequelize) {
    super.init(
      {
        token: DataTypes.STRING,
        plataforma: DataTypes.STRING,
        device: DataTypes.STRING
      },
      {
        sequelize,
        tableName: 'push_token',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  }
}

module.exports = PushToken;