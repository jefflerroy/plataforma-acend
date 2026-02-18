const { Model, DataTypes } = require('sequelize');

class Post extends Model {
  static init(sequelize) {
    super.init(
      {
        usuario_id: DataTypes.INTEGER,
        legenda: DataTypes.STRING,
        imagem: DataTypes.TEXT,
        total_curtidas: DataTypes.INTEGER,
        total_comentarios: DataTypes.INTEGER
      },
      {
        sequelize,
        tableName: 'post',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

    this.hasMany(models.PostCurtida, { foreignKey: 'post_id', as: 'curtidas' });
    this.hasMany(models.PostComentario, { foreignKey: 'post_id', as: 'comentarios' });
  }
}

module.exports = Post;
