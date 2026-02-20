const { Model, DataTypes } = require('sequelize');

class Configuracoes extends Model {
    static init(sequelize) {
        super.init(
            {
                unico: DataTypes.BOOLEAN,
                bloquear_agendamentos: DataTypes.DATE,
                chatpgt_key: DataTypes.STRING,
                whatsapp_agendamentos: DataTypes.STRING
            },
            {
                sequelize,
                tableName: 'configuracoes',
            }
        );
    }

    static associate(models) { }

}

module.exports = Configuracoes;
