require('dotenv').config();
const mysql = require('mysql2/promise');
const sequelize = require('./config/database');
const { User, Attendance, Department } = require('./models');

const seedDatabase = async () => {
    const DB_NAME = process.env.DB_NAME || 'face_attendance_db';
    const DB_USER = process.env.DB_USER || 'root';
    const DB_PASS = process.env.DB_PASS || '123456';
    const DB_HOST = process.env.DB_HOST || '127.0.0.1';

    try {
        // 1. Create database if not exists using raw connection
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASS
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        await connection.end();
        console.log(`✅ Database \`${DB_NAME}\` verified/created.`);

        // 2. Sync models using the ALREADY DEFINED sequelize instance
        await sequelize.sync({ force: true });
        console.log('✅ Models synchronized (tables created).');

        const departments = [
            { name: 'Engineering', description: 'Software and Hardware development' },
            { name: 'Human Resources', description: 'People and Culture' },
            { name: 'Sales', description: 'Sales and Marketing' },
            { name: 'Operations', description: 'Day to day operations' }
        ];

        for (const dept of departments) {
            await Department.findOrCreate({
                where: { name: dept.name },
                defaults: dept
            });
        }

        console.log('✅ Database seeded successfully with departments!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
