'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('horario_funcionamento', {
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

      dia_semana: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      hora_inicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      
      intervalo_inicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      intervalo_fim: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      hora_fim: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      intervalo_atendimento: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex('horario_funcionamento', ['dia_semana']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('horario_funcionamento');
  },
};
