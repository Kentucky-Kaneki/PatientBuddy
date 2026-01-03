import User from "../models/User.js";

export const getFamilyMembers = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("Getting family members for user:", userId);
    
    const user = await User.findById(userId).select('familyMembers activeMemberId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("Found family members:", user.familyMembers);

    res.json({
      success: true,
      familyMembers: user.familyMembers,
      activeMemberId: user.activeMemberId,
    });
  } catch (err) {
    console.error("Get family members error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const initializeFamilyMembers = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("Initializing family members for user:", userId);
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // If already has family members, don't initialize
    if (user.familyMembers && user.familyMembers.length > 0) {
      return res.json({
        success: true,
        message: "Family members already initialized",
        familyMembers: user.familyMembers,
      });
    }

    // Create "You" profile
    const initials = user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    user.familyMembers.push({
      name: 'You',
      relationship: 'Self',
      initials: initials,
      avatar: '#3b82f6',
    });
    
    user.activeMemberId = user.familyMembers[0]._id.toString();
    await user.save();

    console.log("Family members initialized:", user.familyMembers);

    res.json({
      success: true,
      message: "Family members initialized",
      familyMembers: user.familyMembers,
    });
  } catch (err) {
    console.error("Initialize family members error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const addFamilyMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, relationship, dateOfBirth, gender } = req.body;

    if (!name || !relationship) {
      return res.status(400).json({
        success: false,
        error: "Name and relationship are required",
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const avatar = colors[Math.floor(Math.random() * colors.length)];

    const newMember = {
      name,
      relationship,
      dateOfBirth,
      gender,
      initials,
      avatar,
    };

    user.familyMembers.push(newMember);
    await user.save();

    res.json({
      success: true,
      message: "Family member added successfully",
      familyMember: user.familyMembers[user.familyMembers.length - 1],
    });
  } catch (err) {
    console.error("Add family member error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const setActiveMember = async (req, res) => {
  try {
    const { userId, memberId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const memberExists = user.familyMembers.id(memberId);
    
    if (!memberExists) {
      return res.status(404).json({
        success: false,
        error: "Family member not found",
      });
    }

    user.activeMemberId = memberId;
    await user.save();

    res.json({
      success: true,
      message: "Active member updated",
      activeMemberId: memberId,
    });
  } catch (err) {
    console.error("Set active member error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const deleteFamilyMember = async (req, res) => {
  try {
    const { userId, memberId } = req.params;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const member = user.familyMembers.id(memberId);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: "Family member not found",
      });
    }

    if (member.relationship === 'Self') {
      return res.status(400).json({
        success: false,
        error: "Cannot delete your own profile",
      });
    }

    user.familyMembers.pull(memberId);
    
    if (user.activeMemberId === memberId) {
      const selfMember = user.familyMembers.find(m => m.relationship === 'Self');
      user.activeMemberId = selfMember._id.toString();
    }
    
    await user.save();

    res.json({
      success: true,
      message: "Family member deleted successfully",
    });
  } catch (err) {
    console.error("Delete family member error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};