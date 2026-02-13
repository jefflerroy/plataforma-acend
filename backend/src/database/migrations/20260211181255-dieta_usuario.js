'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dieta_usuario', {
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
          key: 'id'
        },
        onDelete: 'CASCADE'
      }, 
      dieta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dieta',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('dieta_usuario');
  },
};
