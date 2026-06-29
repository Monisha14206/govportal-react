const mongoose = require('mongoose');

// Mongoose's findById() throws a CastError (and crashes the request with a
// 500) if the id isn't a valid 24-character ObjectId hex string - e.g. if a
// user fiddles with the URL. This mirrors the old SQLite behaviour, where an
// invalid/unknown id simply meant "not found" (404), never a server error.
async function safeFindById(Model, id) {
  if (!id || !mongoose.isValidObjectId(id)) return null;
  return Model.findById(id);
}

module.exports = { safeFindById };
