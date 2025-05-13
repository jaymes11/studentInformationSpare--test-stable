import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Method to compare password - simple string comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  return this.password === candidatePassword;
};

const User = mongoose.model("users-data", userSchema);

export default User;