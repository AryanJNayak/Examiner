import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate ,useLocation} from 'react-router-dom';
import Navbar from './Navbar';
import Profile from './Profile';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null; // Prevent rendering if not logged in

  return (
    <>
      {/* <Navbar /> */}
      <div className="container mt-4">
        {message && <div className='alert alert-success'>{message}</div>}
        <h2>Welcome to Home Page</h2>
        <Profile />
      </div>
    </>
  );
};

export default Home;