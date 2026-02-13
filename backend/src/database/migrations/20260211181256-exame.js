'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exame', {
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
      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nome_original: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nome_armazenado: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      caminho: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'application/pdf',
      },
      tamanho_bytes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      hash_sha256: {
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

    await queryInterface.addIndex('exame', ['paciente_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('exame');
  },
};
