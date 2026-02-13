const { Model, DataTypes } = require('sequelize');

class PostCurtida extends Model {
  static init(sequelize) {
    super.init(
      {
        post_id: DataTypes.INTEGER,
        usuario_id: DataTypes.INTEGER,

        created_at: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
        updated_at: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
      },
      {
        sequelize,
        tableName: 'post_curtida',
        timestamps: false,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
    this.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  }
}

module.exports = PostCurtida;
