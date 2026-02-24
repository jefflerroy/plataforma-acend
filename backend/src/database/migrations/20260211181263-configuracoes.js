'use strict';

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
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      chatpgt_key: {
        type: Sequelize.STRING,
        allowNull: true,
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

    await queryInterface.bulkInsert('configuracoes', [
      {
        unico: true,
        bloquear_agendamentos: false,
        chatpgt_key: null,
        whatsapp_agendamentos: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('configuracoes');
  },
};