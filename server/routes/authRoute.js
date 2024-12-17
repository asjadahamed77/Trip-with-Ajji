import express from 'express'
import { isAuthenticated, loginUser, logoutUser, registerUser, sendVerifyOtp, verifyEmail } from '../controllers/authController.js'
import userAuth from '../middleware/userAuth.js'

const authRouter = express.Router()

authRouter.post('/register',registerUser)
authRouter.post('/login',loginUser)
authRouter.post('/logout',logoutUser)
authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp)
authRouter.post('/verify-account',userAuth,verifyEmail)
authRouter.post('/is-auth',userAuth,isAuthenticated)

export default authRouter