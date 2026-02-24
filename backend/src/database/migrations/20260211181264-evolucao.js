'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('evolucao', {
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
      peso: {
        type: Sequelize.NUMERIC(5,2),
        allowNull: false,
      },
      massa_muscular: {
        type: Sequelize.NUMERIC(5,2),
        allowNull: false,
      },
      massa_gordura: {
        type: Sequelize.NUMERIC(5,2),
        allowNull: false,
      },
      percentual_gordura: {
        type: Sequelize.NUMERIC(5,2),
        allowNull: false,
      },
      imc: {
        type: Sequelize.NUMERIC(5,2),
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('evolucao');
  },
};