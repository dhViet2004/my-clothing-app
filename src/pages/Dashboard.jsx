import React from 'react'
import DashboardHeader from '../components/DashboardHeader';
import Overview from '../components/Overview';
import { Outlet } from 'react-router-dom';

function Dashboard() {
    return (
        <div>
            <DashboardHeader/>
            <Outlet />
        </div>
    )
}

export default Dashboard
