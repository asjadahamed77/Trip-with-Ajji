import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

export const AppContextProvider = (props) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL

    axios.defaults.withCredentials = true 

    const [isLoggedin,setIsLoggedin] = useState(false)
    const [userData,setUserData] = useState(false)
  
    const getUserAuth = async()=>{
        try {
            const {data} = await axios.get(backendUrl+"/api/auth/is-auth")
            if(data.success){
                setIsLoggedin(true)
                getUserData()
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getUserData = async()=>{
        try {
            const {data} = await axios.get(backendUrl+'/api/user/data')
            data.success? setUserData(data.userData) : toast.error(data.message)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Send verification OTP
    const sendVerficationOtp = async(req, res)=> {
        try {
            axios.defaults.withCredentials = true 
            const {data} = await axios.post(backendUrl+'/api/auth/send-verify-otp')
            if(data.success){
                
                toast.success(data.message)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getUserAuth()
    },[])

    const value = {
        backendUrl,isLoggedin,setIsLoggedin,userData,setUserData,getUserData,getUserAuth,sendVerficationOtp
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}