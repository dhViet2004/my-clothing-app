import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axiosConfig';

// 1. Tạo Context với giá trị mặc định
const DataContext = createContext();

// 2. Tạo Provider component
export const DataProvider = ({ children }) => {
  const [stats, setStats] = useState({
    turnover: { current: 0, change: 0, rawData: [] },
    profit: { current: 0, change: 0, rawData: [] },
    newCustomers: { current: 0, change: 0, rawData: [] },
    loading: true,
    error: null,
  });

  const [activeFilter, setActiveFilter] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableTitle, setTableTitle] = useState('Detailed Report');

  // Hàm fetch dữ liệu từ server
  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      console.log('Fetching stats data...');

      // Fetch data from all APIs
      const [turnoverRes, profitRes, customersRes] = await Promise.all([
        axios.get('/turnover').catch(error => {
          console.error('Error fetching turnover:', error.response?.data || error.message);
          throw error;
        }),
        axios.get('/profit').catch(error => {
          console.error('Error fetching profit:', error.response?.data || error.message);
          throw error;
        }),
        axios.get('/customers').catch(error => {
          console.error('Error fetching customers:', error.response?.data || error.message);
          throw error;
        })
      ]);

      console.log('API Responses:', {
        turnover: turnoverRes.data,
        profit: profitRes.data,
        customers: customersRes.data
      });

      // Process turnover data
      const turnoverData = turnoverRes.data || [];
      const latestTurnover = turnoverData[0] || { amount: 0, change: 0 };
      const turnoverDetails = turnoverData.map(item => ({
        id: item.id || item.month,
        date: item.date || item.month,
        amount: parseFloat(item.amount) || 0,
        current: parseFloat(item.current) || parseFloat(item.amount) || 0,
        status: item.status || 'Completed',
        name: item.name || new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        orderCount: parseInt(item.orderCount) || 0,
        change: parseFloat(item.change) || 0
      }));

      // Process profit data
      const profitData = profitRes.data || [];
      const latestProfit = profitData[0] || { amount: 0, change: 0 };
      const profitDetails = profitData.map(item => ({
        id: item.id,
        date: item.date,
        amount: item.amount,
        current: item.amount,
        status: item.status,
        name: item.name,
        orderCount: item.orderCount,
        change: item.change,
        totalRevenue: item.totalRevenue
      }));

      // Process customers data
      const customers = customersRes.data?.customers || [];
      const currentNewCustomers = customers.filter(c => c.status === 'New').length;
      const customerChange = customers.length ? ((currentNewCustomers / customers.length) * 100).toFixed(2) : 0;
      const customerDetails = customers.map(customer => ({
        id: customer.user_id,
        name: customer.full_name,
        email: customer.email,
        status: customer.status,
        date: customer.created_at
      }));

      // Update stats state
      const newStats = {
        turnover: {
          current: latestTurnover.amount,
          change: latestTurnover.change,
          details: turnoverDetails
        },
        profit: {
          current: latestProfit.amount,
          change: latestProfit.change,
          details: profitDetails
        },
        newCustomers: {
          current: currentNewCustomers,
          change: customerChange,
          details: customerDetails
        },
        loading: false,
        error: null
      };

      console.log('Setting new stats:', newStats);
      setStats(newStats);

      // Set initial table data
      setTableData(customerDetails);
      setTableTitle('New Customers Details');
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch statistics data'
      }));
    }
  };


  // Hàm định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Function to fetch profit data from server
  const fetchProfitData = async () => {
    try {
      console.log('Fetching profit data...');
      const response = await axios.get('/profit');
      const profitData = response.data;
      console.log('Raw profit data from API:', profitData);

      // Process profit data
      const profitDetails = profitData.map(item => ({
        id: item.month,
        date: item.month,
        amount: item.amount,
        current: item.amount,
        status: 'Completed',
        name: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        orderCount: item.orderCount,
        change: item.change,
        totalRevenue: item.totalRevenue
      }));

      console.log('Processed profit details:', profitDetails);

      // Update stats with new profit data
      setStats(prev => ({
        ...prev,
        profit: {
          ...prev.profit,
          current: profitData[0]?.amount || 0,
          change: profitData[0]?.change || 0,
          details: profitDetails
        },
        loading: false
      }));

      // Update table data
      setTableData(profitDetails);
      setTableTitle('Profit Details');
    } catch (error) {
      console.error('Error fetching profit data:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch profit data'
      }));
    }
  };

  // Hàm xử lý click filter
  const handleButtonClick = (type) => {
    console.log('Button clicked:', type);
    console.log('Current stats:', stats);
    
    setActiveFilter(type);
    
    if (type === 'turnover') {
      setTableData(stats.turnover.details);
      setTableTitle('Turnover Details');
    } else if (type === 'profit') {
      setTableData(stats.profit.details);
      setTableTitle('Profit Details');
    } else if (type === 'customers') {
      setTableData(stats.newCustomers.details);
      setTableTitle('New Customers Details');
    }
  };

  // Function to fetch turnover data from server
  const fetchTurnoverData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await axios.get('/turnover');
      const turnoverData = response.data;
      
      // Process turnover data
      const turnoverDetails = turnoverData.map(item => ({
        id: item.month,
        date: item.month,
        amount: item.amount,
        current: item.amount,
        status: 'Completed',
        name: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }));
      
      // Update stats with new turnover data
      setStats(prev => ({
        ...prev,
        turnover: {
          ...prev.turnover,
          current: turnoverData[0]?.amount || 0,
          change: turnoverData[0]?.change || 0,
          details: turnoverDetails
        },
        loading: false
      }));
      
      // Update table data
      setTableData(turnoverDetails);
      setTableTitle('Turnover Details');
    } catch (error) {
      console.error('Error fetching turnover data:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch turnover data'
      }));
    }
  };

  // Hàm cập nhật dữ liệu
  const updateData = (newData) => {
    setTableData(newData); // Cập nhật tableData trực tiếp
    if (activeFilter === 'turnover') {
      setStats(prev => ({
        ...prev,
        turnover: { ...prev.turnover, rawData: newData },
      }));
    } else if (activeFilter === 'profit') {
      setStats(prev => ({
        ...prev,
        profit: { ...prev.profit, rawData: newData },
      }));
    } else if (activeFilter === 'customers') {
      setStats(prev => ({
        ...prev,
        newCustomers: { ...prev.newCustomers, rawData: newData },
      }));
    }
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DataContext.Provider
      value={{
        stats,
        activeFilter,
        tableData,
        tableTitle,
        formatCurrency,
        handleButtonClick,
        updateData,
        fetchStats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// 3. Tạo custom hook để sử dụng context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// 4. Export Context
export default DataContext;