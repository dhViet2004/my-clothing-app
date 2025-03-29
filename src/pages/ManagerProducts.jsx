import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Space, message } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import ProductList from '../components/ProductList';

function ManagerProducts() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddProduct = () => navigate('/add-product');
    const handleSearch = () => message.info(`Đang tìm kiếm: ${searchText}`);
    const handleRefresh = () => {
        setSearchText('');
        setRefreshKey(prev => prev + 1);
        message.success('Đã làm mới danh sách');
    };

    return (
        <div className="p-4">
            <Card
                title={
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <span className="text-xl font-semibold">Quản lý sản phẩm</span>
                        <Space size="middle" className="w-full md:w-auto">
                            <Input
                                placeholder="Tìm kiếm sản phẩm"
                                prefix={<SearchOutlined />}
                                allowClear
                                value={searchText}
                                style={{ width: '100%', maxWidth: 300 }}
                                onChange={(e) => setSearchText(e.target.value)}
                                onPressEnter={handleSearch}
                            />
                            <Button 
                                type="default" 
                                onClick={handleRefresh}
                                icon={<ReloadOutlined />}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleAddProduct}
                                icon={<PlusOutlined />}
                            >
                                Thêm sản phẩm
                            </Button>
                        </Space>
                    </div>
                }
                variant="borderless"
                className="shadow-sm"
            >
                <ProductList key={refreshKey} searchQuery={searchText} />
            </Card>
        </div>
    );
}

export default ManagerProducts;