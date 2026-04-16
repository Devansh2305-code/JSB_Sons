const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/jsbsons';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const UserSchema = new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: String,
    role: String, phone: String, address: String,
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  // Create demo owner
  const ownerExists = await User.findOne({ email: 'owner@jsb.com' });
  if (!ownerExists) {
    const hashed = await bcrypt.hash('owner123', 12);
    await User.create({ name: 'JSB Owner', email: 'owner@jsb.com', password: hashed, role: 'owner', phone: '+91 98765 43210' });
    console.log('✅ Demo owner created: owner@jsb.com / owner123');
  } else {
    console.log('ℹ️  Demo owner already exists');
  }

  // Create demo customer
  const custExists = await User.findOne({ email: 'customer@jsb.com' });
  if (!custExists) {
    const hashed = await bcrypt.hash('customer123', 12);
    await User.create({ name: 'Rahul Kumar', email: 'customer@jsb.com', password: hashed, role: 'customer', phone: '+91 99999 11111' });
    console.log('✅ Demo customer created: customer@jsb.com / customer123');
  } else {
    console.log('ℹ️  Demo customer already exists');
  }

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);
