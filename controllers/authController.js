// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'hnasreen1993@gmail.com',
//     pass: process.env.PASSWORD
//   }
// });

// Register User
exports.register = async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  if (!email|| !firstName || !lastName || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ email: email, firstName: firstName, lastName: lastName, password: await bcrypt.hash(password, 10) });

    console.log('New user created:', user);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET , { expiresIn: '1h' });

    user.resetToken = token;

    await user.save();

    console.log('JWT token generated:', token); // Log JWT token

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hnasreen1993@gmail.com',
        pass: process.env.PASSWORD
      }
    });


    const mailOptions = {
      from: 'hnasreen1993@gmail.com',
      to: email,
      subject: 'Account Activation Link',
      text: `Please click on the given link to activate your account - 
            ${process.env.CLIENT_URL}/auth/activate/${token}`
    };

    // await transporter.sendMail(mailOptions);

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
          console.log(error);
          return res.status(500).json({ message: 'Error sending email' });
      } else {
        console.log('Email sent:', info.response);
          return res.json({ success: true, message: 'Reset password link sent' });
      }
  });

    // await user.save();

    // res.status(200).json({ message: 'Registration successful! Please check your email to activate your account.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Activate User
exports.activate = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid activation link' });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({ message: 'Account activated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hnasreen1993@gmail.com',
        pass: process.env.PASSWORD
      }
    });

    const mailOptions = {
      from: 'hnasreen1993@gmail.com',
      to: email,
      subject: 'Password Reset Link',
      html: `<h2>Please click on the given link to reset your password</h2>
             <a href="${process.env.CLIENT_URL}/reset-password/${token}">Reset Password</a>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
          console.log(error);
          return res.status(500).json({ message: 'Error sending email' });
      } else {
          return res.json({ success: true, message: 'Reset password link sent' });
      }
  });

    // res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};