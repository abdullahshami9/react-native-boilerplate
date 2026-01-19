const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('AppStarter', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
});

module.exports = sequelize;
