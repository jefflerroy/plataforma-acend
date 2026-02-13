'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_comentario', {
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

      comentario: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('post_comentario', ['post_id']);
    await queryInterface.addIndex('post_comentario', ['usuario_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('post_comentario');
  },
};
