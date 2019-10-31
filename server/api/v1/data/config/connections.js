const mongoclient = require("mongodb").MongoClient;
const config = require("../../../../config")({ defaultConfig: { database: "database" } })

const mongoConfig = {
    serverUrl: "mongodb://localhost:27017/",
    database: config.database
};

let _connection = undefined;
let _db = undefined;

let connectDb = async () => {
    if ( !_connection ) {
        _connection = await mongoclient.connect(mongoConfig.serverUrl, { useNewUrlParser: true });
        _db = await _connection.db(mongoConfig.database);
    }
    return _db;
}

module.exports = connectDb;