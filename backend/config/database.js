const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('AppStarter', 'root', process.env.DB_PASSWORD || 'root', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
        max: 100,      // Maximum number of connection in pool
        min: 0,        // Minimum number of connection in pool
        acquire: 60000, // max time in ms to try to get connection before throwing error
        idle: 10000    // max time in ms a connection can be idle before being released
    }
});

module.exports = sequelize;
