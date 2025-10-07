const mongoose = require('mongoose');

const LogoSectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logos: [{
    url: { type: String, required: true },
    altText: { type: String, required: true },
    width: { type: Number, default: 120 },
    height: { type: Number, default: 40 },
    isActive: { type: Boolean, default: false }
  }],
  text: { type: String, default: '' },
  showText: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('LogoSection', LogoSectionSchema);