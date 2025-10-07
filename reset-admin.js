const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Admin User Schema
const adminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const AdminUser = mongoose.model('AdminUser', adminUserSchema);

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liquidata');
    console.log('Connected to MongoDB');

    // Delete existing admin
    await AdminUser.deleteOne({ username: 'admin' });
    console.log('Removed existing admin user...');

    // Create new admin user with default password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await AdminUser.create({
      username: 'admin',
      email: 'admin@liquidata.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true
    });

    console.log('\n✅ Admin user reset successfully!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   🌐 URL:      http://localhost:3000/admin/login');
    console.log('   👤 Username: admin');
    console.log('   🔑 Password: admin123');
    console.log('   📧 Email:    admin@liquidata.com');
    console.log('   🎖️  Role:     super_admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔒 IMPORTANT: Change this password after first login!');
    console.log('💡 TIP: Save these credentials in a secure location\n');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error resetting admin:', error);
    process.exit(1);
  }
}

resetAdmin();

