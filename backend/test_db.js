const mysql = require('mysql2');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'AppStarter' // Try connecting directly to the DB
};

console.log('Attempting to connect to database...');

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('ERROR: Database "AppStarter" does not exist.');
        } else {
            console.error('ERROR: Could not connect to database.', err);
        }
        process.exit(1);
    }
    console.log('SUCCESS: Connected to database "AppStarter".');

    const checkTableQuery = "SHOW TABLES LIKE 'users'";
    connection.query(checkTableQuery, (err, results) => {
        if (err) {
            console.error('ERROR: Failed to query tables.', err);
            process.exit(1);
        }

        if (results.length > 0) {
            console.log('SUCCESS: Table "users" exists.');

            // Check table schema
            const describeQuery = "DESCRIBE users";
            connection.query(describeQuery, (err, structure) => {
                if (err) {
                    console.error('ERROR: Failed to describe table.', err);
                } else {
                    console.log('Table structure:');
                    structure.forEach(col => {
                        console.log(` - ${col.Field} (${col.Type})`);
                    });
                }
                connection.end();
                process.exit(0);
            });

        } else {
            console.error('ERROR: Table "users" does not exist.');
            connection.end();
            process.exit(1);
        }
    });
});
