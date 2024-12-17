import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator'; 
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

// Registering the User
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing Details" });
    }
    if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Invalid Email Address" });
    }
    if (password.length < 8) {
        return res.json({ success: false, message: "Password must be at least 8 characters long" });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User Already Registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        // sending email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to OUR COMPANY",
            text: `Welcome to uor company. Your account has been created with email id: ${email}.`
        }

        await transporter.sendMail(mailOptions)

        return res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);
    }
};

// Login for User
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.json({ success: false, message: "Email and Password are required" });
    }
    if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Invalid Email Address" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Please enter the correct password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        return res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);
    }
};

// Logout user
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.json({ success: true, message: "Logged Out" });
    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);
    }
};

// send verify otp 
export const sendVerifyOtp = async (req,res) => {
    try {
        const {userId} = req.body
        const user = await userModel.findById(userId)

        if(user.isAccountVerified){
            return res.json({success: false, message: "Account is already verified"})
        }
       const otp = String(Math.floor(100000+Math.random()*900000))
       user.verifyOtp = otp
       user.verifyOtpExpireAt = Date.now() + 5*1000*60
       await user.save()

       const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "ACCOUNT VERIFICATION OTP",
        text: `Your otp is ${otp}. Verify your account using this otp.`
    }
    await transporter.sendMail(mailOptions)

    res.json({success:true, message:"Verification OTP sent on email."})

    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);
    }
}

// verify email
export const verifyEmail = async (req,res) => {
    const {userId, otp} = req.body
        if(!userId, !otp){
            return res.json({ success: false, message: "Missing Details" });
        }
    try {
        const user = await userModel.findById(userId)
        if(!user){
            return res.json({ success: false, message: "User not found." });
        }
        if(user.verifyOtp === "" || user.verifyOtp !== otp){
            return res.json({ success: false, message: "Invalid Otp." });
        }
        if(user.verifyOtpExpireAt > Date.now()){
            return res.json({ success: false, message: "Otp Expired." });
        }

        user.isAccountVerified = true
        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0

        await user.save()
        return res.json({ success: true, message: "Email verified successfully." });
    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);
    }
}

// check user is authenticated
export const isAuthenticated = async (req,res) => {
    try {
        return res.json({success: true})
    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);  
    }
}

// send password reset otp

export const sendResetOtp = async (req, res) => {
    const {email} = req.body
    if(!email){
        return res.json({ success: false, message: "Email is required." });
    }

    try {
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({ success: false, message: "User not found." }); 
        }

        const otp = String(Math.floor(100000+Math.random()*900000))
       user.resetOtp = otp
       user.resetOtpExpireAt = Date.now() + 5*1000*60
       await user.save()

       const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "RESET PASSWORD OTP",
        text: `Your otp is ${otp}. Reset your account using this otp.`
    }
    await transporter.sendMail(mailOptions)

    return res.json({success:true, message: "Otp is sent to your email"})
         

    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);  
    }
}

// reset user password
export const resetPassword = async (req, res) => {
    const {email,otp,newPassword} = req.body
    if(!email || !otp || !newPassword){
        return res.json({success:false , message:"Email, Otp and New Password are required."})
    }
    try {
        
    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);  
    }
}