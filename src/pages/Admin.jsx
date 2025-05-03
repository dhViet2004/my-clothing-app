import Menu from '../components/Menu';
import { DataProvider } from '../components/DataContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import ManagerProducts from './ManagerProducts';
import Overview from '../components/Overview';
import AddProduct from '../components/AddProduct';
import OrderManagement from '../components/admin/OrderManagement';

function Admin() {
  return (
    <DataProvider>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white shadow-md">
          <Menu />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Routes>
              {/* 👉 Route mặc định chuyển từ /admin → /admin/dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />

              {/* Route cha: dashboard */}
              <Route path="dashboard" element={<Dashboard />}>
                <Route index element={<Overview />} />
                <Route path="turnover" element={<Overview />} />
                <Route path="profit" element={<Overview />} />
                <Route path="customers" element={<Overview />} />
              </Route>

              {/* Route khác */}
              <Route path="managerProducts" element={<ManagerProducts />} />
              <Route path="managerProducts/add" element={<AddProduct />} />
              <Route path="orders" element={<OrderManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    </DataProvider>
  );
}

export default Admin;
