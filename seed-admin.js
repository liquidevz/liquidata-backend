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

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://myliquidata:myliquidata@liquidata-backend.pje93kc.mongodb.net/?retryWrites=true&w=majority&appName=liquidata-backend');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username: admin');
      console.log('Use your existing password to login');
    } else {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await AdminUser.create({
        username: 'admin',
        email: 'admin@liquidata.com',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true
      });

      console.log('\n✅ Admin user created successfully!');
      console.log('\n📝 Login Credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Email: admin@liquidata.com');
      console.log('   Role: super_admin');
      console.log('\n🔒 Please change the password after first login!');
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();

