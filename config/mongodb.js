const { MongoClient, Db } = require("mongodb")
require('dotenv').config()

module.exports = class Mongodb {
    db = null
    url = process.env.MONGO_URL ? process.env.MONGO_URL : ""
    /**
     * Pega o banco de dados
     * @returns {Promise<Db>}
     */
    async getDB() {
        return new Promise(res => {
            if (this.db === null) {
                console.log(this.url);
                MongoClient.connect(this.url, {
                    maxPoolSize: 10
                }, (err, db) => {
                    if(err) console.log(err);
                    if (db)
                        this.db = db.db("stonkswallet");
                    res(this.db)
                })
            } else
                res(this.db)
        })
    }
}