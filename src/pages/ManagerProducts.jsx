import React, { useState } from 'react';
import { Button, Card, Input, Space, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import ProductList from '../components/ProductList';
import AddProductForm from '../components/AddProductForm';

function ManagerProducts() {
    const [searchText, setSearchText] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false); // NEW

    const handleSearch = async () => {
        try {
            setLoading(true);
            message.info(`Đang tìm kiếm: ${searchText}`);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            message.error('Lỗi khi tìm kiếm sản phẩm');
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setLoading(true);
            setSearchText('');
            setRefreshKey(prev => prev + 1);
            message.success('Đã làm mới danh sách');
        } catch (error) {
            message.error('Lỗi khi làm mới danh sách');
            console.error('Refresh error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSuccess = () => {
        message.success('Thêm sản phẩm thành công!');
        setRefreshKey(prev => prev + 1); // refresh product list
        setIsModalVisible(false);        // close modal
    };

    return (
        <div>
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
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => setIsModalVisible(true)} // Mở modal
                                icon={<PlusOutlined />}
                                loading={loading}
                            >
                                Thêm sản phẩm
                            </Button>
                        </Space>
                    </div>
                }
                variant="borderless"
                className="shadow-sm"
            >
                <ProductList
                    searchQuery={searchText}
                    refreshKey={refreshKey}
                    setRefreshKey={setRefreshKey}
                />
            </Card>

            {/* Modal chứa form thêm sản phẩm */}
            <Modal
                title="Thêm sản phẩm mới"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <AddProductForm
                    onSuccess={handleAddSuccess}
                    onClose={() => setIsModalVisible(false)}
                />
            </Modal>
        </div>
    );
}

export default ManagerProducts;
