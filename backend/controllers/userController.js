import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Member from "../models/Member.js";
import Report from "../models/Report.js";

// export const getUserInfo = async (req, res) => {
//   try {
//     const token = req.headers['authorization'].split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     console.log("Feching user data", req.user);
    
//     const user = await User.findById(req.user.id).populate('members');
    
//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

export const getUserInfo = async (req, res) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).populate('members');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error("getUserInfo error:", err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

// ✅ SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      members: []
    });
    
    // Create primary member (same name as user)
    const primaryMember = new Member({
      name,
    });
    await primaryMember.save();

    newUser.members.push(primaryMember._id);

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    
    res.status(201).json({ 
      message: "Signup successful", 
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ SIGNIN
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    
    const user = await User.findOne({ email });
    
    if (user == null) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.status(200).json({ 
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addFamilyMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const newMember= new Member({ name });
    await newMember.save();

    user.members.push(newMember._id);
    await user.save();

    res.json({
      success: true,
      message: "Member added successfully",
      member: user.members[user.members.length - 1],
    });
  } catch (err) {
    console.error("Add family member error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getUserHistory = async (req, res) => {
  try {
    const { memberId, search = "", type = "all" } = req.query;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "memberId is required",
      });
    }

    let history = [];

    /* ================= REPORTS ================= */
    if (type === "all" || type === "report") {
      const member = await Member.findById(memberId)
        .populate('reports', 'fileName summary keyFindings recommendations uploadDate')
        .lean();

      const reports = (member.reports || [])
        .filter(r => search === '' || (r.fileName && r.fileName.match(new RegExp(search, 'i'))))
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

      history.push(
        ...reports.map((r) => ({
          id: r._id,
          type: "report",
          title: r.fileName,
          summary: r.summary,
          recommendations: r.recommendations,
          highlights: r.keyFindings ? [r.keyFindings] : [],
          date: r.uploadDate,
          lab: "Uploaded Report"
        }))
      );
    }

    /* ================= PRESCRIPTIONS ================= */
    if (type === "all" || type === "prescription") {
      const member = await Member.findById(memberId)
        .populate('prescriptions', 'symptoms findings medications createdAt')
        .lean();

      const prescriptions = (member.prescriptions || [])
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

      history.push(
        ...prescriptions.map((p) => ({
          id: p._id,
          type: "prescription",
          title: "Doctor Prescription",
          symptoms: p.symptoms,
          findings: p.findings,
          date: p.createdAt,
          lab: "Prescription",
          medications: p.medications.map(
            (m) => `${m.name} ${m.dosage}`
          ),
        }))
      );
    }

    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err) {
    console.error("❌ HISTORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getHealthInsights = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get the most recent report
    const latestReport = await Report.findOne({ patient: userId })
      .sort({ uploadDate: -1 })
      .lean();

    if (!latestReport) {
      return res.json({
        success: true,
        insights: [],
      });
    }

    // Extract insights from the report
    const insights = [];

    // Check for concerning findings
    if (latestReport.keyFindings) {
      const findings = latestReport.keyFindings.toLowerCase();
      
      // Vitamin D check
      if (findings.includes('vitamin d') && (findings.includes('low') || findings.includes('deficient'))) {
        insights.push({
          type: 'warning',
          title: 'Vitamin D Level',
          message: 'Your Vitamin D levels from your last test were below optimal range. Consider discussing supplementation with your healthcare provider.',
          date: latestReport.uploadDate,
          reportId: latestReport._id,
        });
      }

      // Cholesterol check
      if (findings.includes('cholesterol') && findings.includes('high')) {
        insights.push({
          type: 'warning',
          title: 'Cholesterol Alert',
          message: 'Your cholesterol levels are elevated. Review dietary recommendations with your doctor.',
          date: latestReport.uploadDate,
          reportId: latestReport._id,
        });
      }

      // Blood pressure check
      if (findings.includes('blood pressure') || findings.includes('hypertension')) {
        insights.push({
          type: 'warning',
          title: 'Blood Pressure',
          message: 'Your blood pressure readings require attention. Please follow up with your healthcare provider.',
          date: latestReport.uploadDate,
          reportId: latestReport._id,
        });
      }

      // Thyroid check
      if (findings.includes('thyroid') && (findings.includes('abnormal') || findings.includes('attention'))) {
        insights.push({
          type: 'attention',
          title: 'Thyroid Panel',
          message: 'Your thyroid test results need attention. Schedule a follow-up appointment with your doctor.',
          date: latestReport.uploadDate,
          reportId: latestReport._id,
        });
      }
    }

    // Check recommendations
    if (latestReport.recommendations && insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Health Recommendations',
        message: latestReport.recommendations.substring(0, 150) + '...',
        date: latestReport.uploadDate,
        reportId: latestReport._id,
      });
    }

    // If no specific insights, show positive message
    if (insights.length === 0 && latestReport.summary) {
      insights.push({
        type: 'success',
        title: 'Recent Test Results',
        message: 'Your recent test results look good. Keep maintaining your healthy lifestyle!',
        date: latestReport.uploadDate,
        reportId: latestReport._id,
      });
    }

    res.json({
      success: true,
      insights: insights.slice(0, 3), // Return max 3 insights
    });

  } catch (err) {
    console.error("Get insights error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};