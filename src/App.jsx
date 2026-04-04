import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import TodosDashboard from './pages/TodosDashboard';
import NotesDashboard from './pages/NotesDashboard';
import LinksDashboard from './pages/LinksDashboard';
import ExpenseDashboard from './pages/ExpenseDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import ShareTarget from './pages/ShareTarget';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { currentUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Detect mobile (iPad Portrait and below)
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 768);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close mobile sidebar on route change
  const closeMobileSidebar = () => setIsMobileOpen(false);

  const sidebarWidth = !currentUser ? '0' : (isMobile ? '260px' : (isCollapsed ? '72px' : '260px'));
  const mainMargin = !currentUser ? '0' : (isMobile ? '0' : (isCollapsed ? '72px' : '260px'));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {currentUser && (
        <>
          {/* Mobile Overlay */}
          {isMobile && isMobileOpen && (
            <div
              onClick={closeMobileSidebar}
              className="modal-backdrop"
              style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                zIndex: 999,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            />
          )}

          {/* Sidebar container */}
          <div style={{
            position: 'fixed',
            left: 0,
            transform: isMobile ? (isMobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
            top: 0,
            width: isMobile ? '260px' : (isCollapsed ? '72px' : '260px'),
            transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s ease',
            zIndex: 1000,
            height: '100vh',
            willChange: 'transform'
          }}>
            <Sidebar
              isCollapsed={isMobile ? false : isCollapsed}
              setIsCollapsed={setIsCollapsed}
              onNavClick={isMobile ? closeMobileSidebar : undefined}
              onCloseMobile={closeMobileSidebar}
            />
          </div>
        </>
      )}

      {/* Main content wrapper */}
      <div style={{
        flex: 1,
        marginLeft: mainMargin,
        transition: 'margin-left 0.35s cubic-bezier(0.4,0,0.2,1)',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        width: isMobile ? '100%' : 'auto'
      }}>
        {currentUser && (
          <Navbar
            onHamburger={() => setIsMobileOpen(true)}
            showHamburger={isMobile}
          />
        )}
        {currentUser ? (
          <div style={{ 
            padding: isMobile ? '1rem' : '2rem', 
            maxWidth: '1200px', 
            margin: '0 auto', 
            width: '100%',
            flex: 1,
            animation: 'fade-in 0.3s ease'
          }}>
            <Routes>
              <Route path="/" element={<PrivateRoute><Navigate to="/todos" /></PrivateRoute>} />
              <Route path="/todos" element={<PrivateRoute><TodosDashboard /></PrivateRoute>} />
              <Route path="/notes" element={<PrivateRoute><NotesDashboard /></PrivateRoute>} />
              <Route path="/links" element={<PrivateRoute><LinksDashboard /></PrivateRoute>} />
              <Route path="/expenses" element={<PrivateRoute><ExpenseDashboard /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/login" element={<Navigate to="/todos" />} />
              <Route path="/signup" element={<Navigate to="/todos" />} />
              <Route path="/share-target" element={<ShareTarget />} />
            </Routes>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/share-target" element={<ShareTarget />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
