import React, { useState, useEffect } from 'react';
import { Card, Input, Row, Col, Pagination, Select, Empty, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = [
        { value: 'dam_vay', label: 'Đầm váy' },
        { value: 'quan_jean', label: 'Quần jean' },
        { value: 'quan_au', label: 'Quần âu' },
        { value: 'ao_so_mi', label: 'Áo sơ mi' },
        { value: 'ao_khoac', label: 'Áo khoác' },
        { value: 'ao_len', label: 'Áo len' },
        { value: 'chan_vay', label: 'Chân váy' },
        { value: 'quan_short', label: 'Quần short' },
        { value: 'ao_phong', label: 'Áo phông' }
    ];

    const fetchProducts = async (page = 1, size = pageSize, search = searchText, category = selectedCategory) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                pageSize: size,
                ...(search && { search }),
                ...(category && { category })
            });

            const response = await axios.get(`http://localhost:8080/products?${params}`);
            setProducts(response.data.data);
            setTotal(response.data.pagination.total);
        } catch (error) {
            console.error('Error fetching products:', error);
            message.error('Có lỗi xảy ra khi tải sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(1);
        fetchProducts(1, pageSize, value, selectedCategory);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        setCurrentPage(1);
        fetchProducts(1, pageSize, searchText, value);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
        fetchProducts(page, size, searchText, selectedCategory);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={12}>
                        <Search
                            placeholder="Tìm kiếm sản phẩm..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Select
                            placeholder="Chọn danh mục"
                            style={{ width: '100%' }}
                            size="large"
                            allowClear
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            {categories.map(category => (
                                <Option key={category.value} value={category.value}>
                                    {category.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </div>

            {products.length === 0 ? (
                <Empty description="Không tìm thấy sản phẩm" />
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        {products.map(product => (
                            <Col xs={24} sm={12} md={8} lg={6} key={product.product_id}>
                                <Card
                                    hoverable
                                    cover={
                                        <img
                                            alt={product.name}
                                            src={product.url || '/placeholder-product.jpg'}
                                            style={{ height: 200, objectFit: 'cover' }}
                                        />
                                    }
                                >
                                    <Card.Meta
                                        title={product.name}
                                        description={
                                            <>
                                                <div className="text-lg font-bold text-red-600">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(product.price)}
                                                </div>
                                                <div className="text-gray-500 text-sm">
                                                    {product.description}
                                                </div>
                                            </>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div className="mt-8 text-center">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={total}
                            onChange={handlePageChange}
                            showSizeChanger
                            showTotal={(total) => `Tổng số ${total} sản phẩm`}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Products; 