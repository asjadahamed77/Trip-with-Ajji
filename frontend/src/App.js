import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar';
import SignUp from './pages/SignUp';

function App() {
  return (
    <div className=' '>
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='sign-up' element={<SignUp />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
