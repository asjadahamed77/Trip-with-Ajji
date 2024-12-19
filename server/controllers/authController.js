import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator'; 
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { PASSWORD_RESET_TEMPLATE, EMAIL_VERIFY_TEMPLATE } from '../config/emailTemplates.js';

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
            if (!existingUser.isAccountVerified) {
                return res.json({ success: false, message: "Email verification pending. Check your email for OTP." });
            }
            return res.json({ success: false, message: "User already registered and verified." });
        }

        // Create a temporary user record with verification pending
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const newUser = new userModel({
            name,
            email,
            password: '', // Leave password empty until verification
            verifyOtp: otp,
            verifyOtpExpireAt: Date.now() + 5 * 60 * 1000, // OTP valid for 5 minutes
            isAccountVerified: false,
        });
        await newUser.save();

        // Send verification email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "ACCOUNT VERIFICATION OTP",
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", email),
        };
        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Verification OTP sent to your email." });
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
        // text: `Your otp is ${otp}. Verify your account using this otp.`,
        html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
    }
    await transporter.sendMail(mailOptions)

    res.json({success:true, message:"Verification OTP sent on email."})

    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);
    }
}

// verify email
export const verifyEmail = async (req, res) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        return res.json({ success: false, message: "Email, OTP, and Password are required." });
    }

    if (password.length < 8) {
        return res.json({ success: false, message: "Password must be at least 8 characters long." });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }
        if (user.verifyOtp !== otp || user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "Invalid or expired OTP." });
        }

        // Update user details and mark as verified
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: "Email verified and account created successfully." });
    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);
    }
};


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
        // text: `Your otp is ${otp}. Reset your account using this otp.`,
        html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
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
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({ success: false, message: "User not found." }); 
        }
        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({ success: false, message: "Invalid Otp." });
        }
        if(user.resetOtpExpireAt > Date.now()){
            return res.json({ success: false, message: "Otp Expired." });
        }

        const hashedPassword = await bcrypt.hash(newPassword,10)
        user.password = hashedPassword
        user.resetOtp = ''
        user.resetOtpExpireAt = 0

        await user.save()
        return res.json({success:true, message: "Password has been reset successfully."})

    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error);  
    }
}