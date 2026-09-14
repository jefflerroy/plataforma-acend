'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('push_token', {
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
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    
      plataforma: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      device: {
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
    await queryInterface.dropTable('push_token');
  },
};