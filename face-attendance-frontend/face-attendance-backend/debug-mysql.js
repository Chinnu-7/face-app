const mysql = require('mysql2/promise');

async function debug() {
    console.log('Starting debug...');
    try {
        console.log('Connecting to localhost:3306 with root/123456');
        const connection = await mysql.createConnection({
            host: '127.0.0.1', // explicitly use IPv4
            user: 'root',
            password: '123456',
            connectTimeout: 10000
        });
        console.log('Connection successful!');
        await connection.end();
    } catch (err) {
        console.error('Connection failed:');
        console.error(err);
    }
}

debug();
