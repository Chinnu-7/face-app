const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'face_attendance_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '123456',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false, // Set to true to see SQL queries
    }
);

module.exports = sequelize;
