const { Model, DataTypes } = require('sequelize');

class Usuario extends Model {
  static init(sequelize) {
    super.init(
      {
        tipo: DataTypes.STRING,
        nome: DataTypes.STRING,
        email: DataTypes.STRING,
        senha: DataTypes.STRING,
        cpf: DataTypes.STRING,
        data_nascimento: DataTypes.DATE,
        sexo: DataTypes.STRING,
        telefone: DataTypes.STRING,
        cep: DataTypes.STRING,
        rua: DataTypes.STRING,
        numero: DataTypes.STRING,
        complemento: DataTypes.STRING,
        bairro: DataTypes.STRING,
        cidade: DataTypes.STRING,
        estado: DataTypes.STRING,
        foto: DataTypes.TEXT,
        fase_metodo_ascend: DataTypes.INTEGER
      },
      {
        sequelize,
        tableName: 'usuario',
      }
    );
  }

  static associate(models) {
    this.hasMany(models.DietaUsuario, { foreignKey: 'paciente_id', as: 'dietasUsuarios' });
    this.hasMany(models.Exame, { foreignKey: 'paciente_id', as: 'exames' });

    this.hasMany(models.Agendamento, { foreignKey: 'paciente_id', as: 'agendamentosPaciente' });
    this.hasMany(models.Agendamento, { foreignKey: 'profissional_id', as: 'agendamentosProfissional' });

    this.hasMany(models.Post, { foreignKey: 'usuario_id', as: 'posts' });
    this.hasMany(models.PostCurtida, { foreignKey: 'usuario_id', as: 'curtidas' });
    this.hasMany(models.PostComentario, { foreignKey: 'usuario_id', as: 'comentarios' });

    this.hasMany(models.BloqueioAgenda, { foreignKey: 'usuario_id', as: 'bloqueiosAgenda' });
    this.hasMany(models.HorarioFuncionamento, { foreignKey: 'usuario_id', as: 'horariosFuncionamento' });

    this.hasMany(models.Evolucao, { foreignKey: 'paciente_id', as: 'evolucoes' });

    this.hasMany(models.Chat, { foreignKey: 'paciente_id', as: 'chats' });
  }
}

module.exports = Usuario;
