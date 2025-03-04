const sendEmail = require('../utils/sendEmail');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const passwordValidation = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!password || !passwordRegex.test(password)) {
      return "Password must be at least 6 characters long, include at least one uppercase letter, one number, and one special character";
    }
    return null; // No error
  };
  
  const SignUpValidations = async (firstName, lastName, email, password) => {
    if (!firstName || firstName.length < 2) {
      return "First name must be at least 2 characters long";
    }
  
    if (!lastName || lastName.length < 2) {
      return "Last name must be at least 2 characters long";
    }
    console.log("entered validation with email", email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return "Invalid email format";
    }
    const passwordError = passwordValidation(password);
    if (passwordError) {
      return passwordError;
    }
  
    return null;
  };

const createAdmin = async (req, res) => {
    try {
        
        const existingAdmin = await User.findOne({ isAdmin: true });
        if (existingAdmin) {
            return res.status(400).json({ message: 'An admin already exists. Only one admin is allowed.' });
        }
        const { firstName, lastName, email, password } = req.body;
        const errorMessage = await SignUpValidations(firstName, lastName, email, password);
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            isEmailVerified: true,
            isAdmin: true, 
        });

        await adminUser.save();
        return res.status(201).json({ message: 'Admin user created successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Admin creation failed', error: error.message });
    }
};

const approveUser = async (req, res) => {
    try {
        const { email, isApprove } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!isApprove) {
            await User.deleteOne({ email }); 
            await sendEmail(email, 'reject', user.firstName);
            return res.status(200).json({ message: 'User removed' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'User approval failed', error: error.message });
    }
};


const getUsers = async(req, res) => {
    try{
        const email = req.query.email;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if(!user.isAdmin){
            return res.status(404).json({ message: 'Operation Not allowed' });
        }
        const users = await User.find({ isAdmin: false , isEmailVerified:true});
        const count = users.length;
        if(count === 0){
            return res.status(400).json({message:'No users found'});
        }
        return res.status(200).json({message:'Users fetched successfully', userCount: count, users :  Array.isArray(users) ? users : []});
    }catch (error) {
        return res.status(500).json({ message: 'Cannot Fetch users', error: error.message ,users: []});
    }
};


module.exports ={createAdmin, approveUser, getUsers}