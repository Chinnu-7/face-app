const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.STRING, // Format: YYYY-MM-DD
        allowNull: false,
    },
    time: {
        type: DataTypes.STRING, // Format: HH:mm:ss
        allowNull: false,
    },
    location: {
        type: DataTypes.JSON, // { lat, lng }
    },
    status: {
        type: DataTypes.ENUM('Present', 'Late', 'Absent'),
        defaultValue: 'Present',
    },
    photoProof: {
        type: DataTypes.TEXT('long'), // For Base64 encoded image
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['date'] },
        { fields: ['status'] }
    ]
});

module.exports = Attendance;
