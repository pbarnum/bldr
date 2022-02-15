import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import storage from '../storage';

const Dashboard = (): React.ReactElement => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Dashboard - Bldr';
  }, []);

  if (!storage.user) {
    navigate('/login');
  }

  return (
    <>
      <DashboardHeader />
    </>
  );
};

export default Dashboard;
