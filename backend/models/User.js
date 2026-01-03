import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  relationship: {
    type: String,
    enum: ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'],
    default: 'Other',
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  avatar: {
    type: String, // Color hex code
    default: '#3b82f6',
  },
  initials: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: false, 
    unique: true, 
    sparse: true // Allows multiple null values
  },
  phone: { 
    type: Number, 
    required: false, 
    unique: true,
    sparse: true // Allows multiple null values
  },
  password: { 
    type: String, 
    required: true 
  },
  familyMembers: [familyMemberSchema],
  activeMemberId: {
    type: String, // ID of currently active family member
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Member" 
  }]
}, { timestamps: true });

// Add self as first family member on user creation
userSchema.pre('save', function(next) {
  // Only run on new documents and if familyMembers is empty
  if (this.isNew && this.familyMembers.length === 0) {
    const initials = this.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    this.familyMembers.push({
      name: 'You',
      relationship: 'Self',
      initials: initials,
      avatar: '#3b82f6',
    });
    
    // Set the first family member as active
    this.activeMemberId = this.familyMembers[0]._id.toString();
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;