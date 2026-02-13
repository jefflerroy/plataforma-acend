const { Model, DataTypes } = require('sequelize');

class Post extends Model {
  static init(sequelize) {
    super.init(
      {
        usuario_id: DataTypes.INTEGER,
        legenda: DataTypes.TEXT,
        imagem: DataTypes.STRING,
        total_curtidas: DataTypes.INTEGER,
        total_comentarios: DataTypes.INTEGER,

        created_at: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
        updated_at: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
      },
      {
        sequelize,
        tableName: 'post',
        timestamps: false,
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
