'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bloqueio_agenda', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuario',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      data_inicio: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      data_fim: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      motivo: {
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

    await queryInterface.addIndex('bloqueio_agenda', ['data_inicio']);
    await queryInterface.addIndex('bloqueio_agenda', ['data_fim']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bloqueio_agenda');
  },
};
