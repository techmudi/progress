import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <>
      <Sidebar />
      <Navbar />

      <div
        style={{
          marginLeft: '280px',
          marginTop: '70px',
          padding: '3px',
          background: '#F1F2EF',
          minHeight: '100vh',
          minWidth: 'calc(100vw - 280px)',
        }}
      >
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
