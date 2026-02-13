'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agendamento', {
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
      profissional_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuario',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'consulta',
      }, // consulta | exame
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pendente',
      }, // pendente | confirmado | cancelado | concluido
      data: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      hora: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      local: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      observacao: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('agendamento', ['paciente_id', 'data']);
    await queryInterface.addIndex('agendamento', ['profissional_id', 'data']);
    await queryInterface.addIndex('agendamento', ['status']);
    await queryInterface.addIndex('agendamento', ['tipo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('agendamento');
  },
};
