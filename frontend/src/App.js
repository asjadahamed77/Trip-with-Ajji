import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar';
import SignUp from './pages/SignUp';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className=' '>
      <BrowserRouter>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path='sign-up' element={<SignUp />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
