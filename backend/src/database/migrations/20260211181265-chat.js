'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      paciente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuario',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      mensagem: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      resposta_ia: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },            
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('chat', ['paciente_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chat');
  },
};