const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  components: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
  isPublished: { type: Boolean, default: false },
  seoTitle: { type: String },
  seoDescription: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Page', PageSchema);