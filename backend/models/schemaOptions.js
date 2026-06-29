// Shared toJSON/toObject transform applied to every model so the API
// keeps returning the same shape the frontend already expects:
// `id` (string) instead of Mongo's `_id`, and no `__v` version key.

function transform(doc, ret) {
  if (ret._id) ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

module.exports = {
  toJSON: { virtuals: true, transform },
  toObject: { virtuals: true, transform }
};
