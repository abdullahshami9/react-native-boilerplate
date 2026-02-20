const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'AppStarter'
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to DB");

    const checks = [
        "SHOW COLUMNS FROM `users` LIKE 'street_id'",
        "SHOW COLUMNS FROM `business_details` LIKE 'street_id'",
        "SHOW COLUMNS FROM `user_metadata` LIKE 'communication_keywords'",
        "SHOW COLUMNS FROM `profile_views` LIKE 'viewer_id'"
    ];

    let completed = 0;
    checks.forEach(sql => {
        db.query(sql, (e, r) => {
            if (e) console.error(e);
            else {
                if (r.length > 0) console.log(sql, "- SUCCESS:", r[0].Field);
                else console.log(sql, "- FAILED: Column not found");
            }

            completed++;
            if (completed === checks.length) db.end();
        });
    });
});
