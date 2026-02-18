const { Model, DataTypes } = require('sequelize');

class PostComentario extends Model {
  static init(sequelize) {
    super.init(
      {
        post_id: DataTypes.INTEGER,
        usuario_id: DataTypes.INTEGER,
        comentario: DataTypes.TEXT
      },
      {
        sequelize,
        tableName: 'post_comentario',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
    this.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  }
}

module.exports = PostComentario;
