import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Row, Col, Typography, Skeleton, Button, Select, Pagination, Spin, Empty } from 'antd';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0
    });
    const [filters, setFilters] = useState({
        category: '',
        sort: 'newest'
    });
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        // Lấy tham số từ URL nếu có
        const params = Object.fromEntries(searchParams.entries());
        setPagination(prev => ({
            ...prev,
            current: params.page ? parseInt(params.page) : 1
        }));
        setFilters(prev => ({
            ...prev,
            category: params.category || '',
            sort: params.sort || 'newest'
        }));
    }, [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/products', {
                    params: {
                        page: pagination.current,
                        pageSize: pagination.pageSize,
                        category: filters.category || undefined,
                        sort: filters.sort
                    }
                });
                
                const productsData = response.data.data || response.data.items || [];
                const totalProducts = response.data.total || response.data.totalItems || 0;
                
                setProducts(productsData);
                setPagination(prev => ({
                    ...prev,
                    total: totalProducts
                }));
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [pagination.current, filters]);

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, current: page }));
        // Cập nhật URL
        const params = new URLSearchParams();
        params.set('page', page);
        if (filters.category) params.set('category', filters.category);
        if (filters.sort) params.set('sort', filters.sort);
        setSearchParams(params);
    };

    const handleFilterChange = (name, value) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        // Reset về trang 1 khi thay đổi bộ lọc
        setPagination(prev => ({ ...prev, current: 1 }));
        
        // Cập nhật URL
        const params = new URLSearchParams();
        params.set('page', 1);
        if (newFilters.category) params.set('category', newFilters.category);
        if (newFilters.sort) params.set('sort', newFilters.sort);
        setSearchParams(params);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Title level={2} className="text-center mb-2">Tất Cả Sản Phẩm</Title>
            
            {/* Filter Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <span className="font-medium">Lọc theo:</span>
                    <Select
                        placeholder="Danh mục"
                        style={{ width: 200 }}
                        value={filters.category}
                        onChange={(value) => handleFilterChange('category', value)}
                        allowClear
                    >
                        <Option value="">Tất cả</Option>
                        <Option value="dam_vay">Đầm/Váy</Option>
                        <Option value="quan_jean">Quần Jean</Option>
                        <Option value="quan_au">Quần Âu</Option>
                        <Option value="ao_so_mi">Áo Sơ Mi</Option>
                        <Option value="ao_khoac">Áo Khoác</Option>
                        <Option value="ao_len">Áo Len</Option>
                        <Option value="chan_vay">Chân Váy</Option>
                        <Option value="quan_short">Quần Short</Option>
                        <Option value="ao_phong">Áo Phông</Option>
                    </Select>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="font-medium">Sắp xếp:</span>
                    <Select
                        style={{ width: 200 }}
                        value={filters.sort}
                        onChange={(value) => handleFilterChange('sort', value)}
                    >
                        <Option value="newest">Mới nhất</Option>
                        <Option value="price_asc">Giá: Thấp đến cao</Option>
                        <Option value="price_desc">Giá: Cao đến thấp</Option>
                        <Option value="popular">Phổ biến</Option>
                    </Select>
                </div>
            </div>
            
            {/* Product List */}
            {loading ? (
                <div className="text-center py-12">
                    <Spin size="large" />
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
            ) : products.length === 0 ? (
                <Empty 
                    description="Không tìm thấy sản phẩm nào phù hợp"
                    className="py-12"
                >
                    <Button type="primary" onClick={() => {
                        setFilters({ category: '', sort: 'newest' });
                        setPagination(prev => ({ ...prev, current: 1 }));
                        setSearchParams({});
                    }}>
                        Xóa bộ lọc
                    </Button>
                </Empty>
            ) : (
                <>
                    <Row gutter={[16, 24]}>
                        {products.map(product => (
                            <Col 
                                key={product.product_id} 
                                xs={12} 
                                sm={12} 
                                md={8} 
                                lg={6} 
                                xl={6}
                                className="flex justify-center"
                            >
                                <ProductCard 
                                    product={product}
                                    className="w-full max-w-xs"
                                />
                            </Col>
                        ))}
                    </Row>
                    
                    {/* Pagination */}
                    <div className="flex justify-center mt-8">
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                            showQuickJumper
                            responsive
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default Products;