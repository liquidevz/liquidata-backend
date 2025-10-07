const mongoose = require('mongoose');

const ComponentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['hero', 'logos', 'features', 'codedemo', 'carousel', 'customers', 'stats', 'pricing', 'cta', 'footer']
  },
  props: { type: mongoose.Schema.Types.Mixed, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  category: { type: String, default: 'general' },
  description: { type: String },
  tags: [{ type: String }]
}, {
  timestamps: true
});

// Add index for better performance
ComponentSchema.index({ order: 1, isActive: 1 });
ComponentSchema.index({ type: 1 });

module.exports = mongoose.model('Component', ComponentSchema);