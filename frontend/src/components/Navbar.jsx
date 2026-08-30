import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Support Portal</Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/tickets">My Tickets</Link>
            <Link to="/tickets/new">New Ticket</Link>
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            <span className="nav-user">Hi, {user.name}</span>
            <button className="btn-link" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
