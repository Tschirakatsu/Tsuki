/**
 * @file    DBConnector.js
 * @brief   quick description of the purpose of the file
 * @author  Created by tschi
 * @version 24/06/2024
 */

const mysql = require('mysql');
const { host, user, password, database, charset, port } = require("./Credentials");

class DBConnector {
    constructor() {
        this.connection = mysql.createConnection({
            host,
            user,
            password,
            database,
            charset,
            port,
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.connection.connect((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    query(sql, values) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, values, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = DBConnector;