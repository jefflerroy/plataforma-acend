'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configuracoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      unico: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        unique: true
      },

      bloquear_agendamentos: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      chatpgt_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      whatsapp_agendamentos: {
        type: Sequelize.STRING,
        allowNull: true,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('configuracoes');
  },
};
