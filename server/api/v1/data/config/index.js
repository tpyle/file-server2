const connectDb = require("./connections");

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollectionFn = collection => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await connectDb();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

module.exports = {
    schemas: require('./schemas')
}