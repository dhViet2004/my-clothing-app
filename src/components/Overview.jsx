import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import DataTable from './DataTable';
import { useData } from '../components/DataContext';

// Import icons từ react-icons
import { MdDashboard, MdBarChart, MdAttachMoney, MdPeople } from 'react-icons/md';

const Overview = () => {
  const {
    stats,
    activeFilter,
    tableData,
    tableTitle,
    formatCurrency,
    handleButtonClick,
    updateData,
  } = useData();

  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('turnover')) {
      handleButtonClick('turnover');
    } else if (location.pathname.includes('profit')) {
      handleButtonClick('profit');
    } else if (location.pathname.includes('customers')) {
      handleButtonClick('customers');
    } else {
      handleButtonClick('customers'); // fallback
    }
  }, [location.pathname]);
  


  if (stats.loading) return <div className="p-4">Loading...</div>;
  if (stats.error) return <div className="p-4 text-red-500">{stats.error}</div>;

  const handleUpdateExample = () => {
    const updatedData = [...tableData];
    updateData(updatedData);
  };

  return (
    <div className="bg-white mt-1 p-4">
      <div className="p-4 flex items-center">
        <MdDashboard className="w-5 h-5 mr-2 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-800">Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        {/* Turnover Card */}
        <NavLink
          to="/admin/dashboard/turnover"

          className={({ isActive }) =>
            `rounded-lg shadow p-6 grid grid-cols-2 transition-colors duration-200 ${isActive ? 'bg-pink-200' : 'bg-pink-100'
            }`
          }
        >
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Turnover</h3>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(stats.turnover.current)}
            </p>
            <PercentageChange change={stats.turnover.change} />
          </div>
          <div className="flex justify-end items-start">
            <MdBarChart className="w-10 h-10 text-pink-600 hover:opacity-80 transition-opacity" />
          </div>
        </NavLink>

        {/* Profit Card */}
        <NavLink
          to="/admin/dashboard/profit"

          className={({ isActive }) =>
            `rounded-lg shadow p-6 grid grid-cols-2 transition-colors duration-200 ${isActive ? 'bg-blue-200' : 'bg-blue-100'
            }`
          }
        >
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Profit</h3>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(stats.profit.current)}
            </p>
            <PercentageChange change={stats.profit.change} />
          </div>
          <div className="flex justify-end items-start">
            <MdAttachMoney className="w-10 h-10 text-blue-600" />
          </div>
        </NavLink>

        {/* Customers Card */}
        <NavLink
          to="/admin/dashboard/customers"

          className={({ isActive }) =>
            `rounded-lg shadow p-6 grid grid-cols-2 transition-colors duration-200 ${isActive ? 'bg-blue-100' : 'bg-blue-50'
            }`
          }
        >
          <div>
            <h3 className="text-gray-500 text-sm font-medium">New Customers</h3>
            <p className="text-2xl font-bold mt-2">{stats.newCustomers.current}</p>
            <PercentageChange change={stats.newCustomers.change} />
          </div>
          <div className="flex justify-end items-start">
            <MdPeople className="w-10 h-10 text-blue-500" />
          </div>
        </NavLink>
      </div>

      <div className="mt-8">
        <DataTable
          data={tableData}
          title={tableTitle}
          avatarField="avatar"
          nameField="name"
          currencyFields={
            activeFilter === 'turnover' || activeFilter === 'profit'
              ? ['amount', 'current']
              : ['orderValue']
          }
          dateFields={['date', 'orderDate']}
          statusField={'status'}
          excludeFields={['avatar']}
          onUpdate={handleUpdateExample}
        />
      </div>
    </div>
  );
};

const PercentageChange = ({ change }) => (
  <div className={`mt-4 ${change >= 0 ? 'text-green-500' : 'text-red-500'} text-sm`}>
    <span className="flex items-center gap-1 whitespace-nowrap">
      {change >= 0 ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 inline"
        >
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 inline"
        >
          <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className="ml-1">{Math.abs(change)}%</span>
      <span className="text-gray-500 ml-1">period of change</span>
    </span>
  </div>
);

export default Overview;
