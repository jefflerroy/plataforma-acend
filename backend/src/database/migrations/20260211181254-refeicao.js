'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refeicao', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      dieta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dieta',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      horario: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      refeicao: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descricao: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      proteinas: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      carboidratos: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      gorduras: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      calorias: {
        type: Sequelize.INTEGER,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refeicao');
  },
};
