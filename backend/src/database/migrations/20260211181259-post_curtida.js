'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_curtida', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'post',
          key: 'id',
        },
        onDelete: 'CASCADE',
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

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint('post_curtida', {
      fields: ['post_id', 'usuario_id'],
      type: 'unique',
      name: 'unique_post_usuario_curtida',
    });

    await queryInterface.addIndex('post_curtida', ['post_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('post_curtida');
  },
};
