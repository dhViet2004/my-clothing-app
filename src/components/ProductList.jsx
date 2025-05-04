import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Space, Button, Modal, message, Input, Form, Select } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const { Option } = Select;
import instance from '../api/axiosConfig';
const ProductList = ({ searchQuery, refreshKey, setRefreshKey }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [form] = Form.useForm();

    // Fetch products from API
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await instance.get('http://localhost:8080/products', {
                params: {
                    search: searchQuery || undefined,
                    page: pagination.current,
                    pageSize: pagination.pageSize,
                }
            });

            let productsData = [];
            let totalCount = 0;

            if (Array.isArray(response.data)) {
                productsData = response.data;
                totalCount = response.data.length;
            } else if (response.data && Array.isArray(response.data.data)) {
                productsData = response.data.data;
                totalCount = response.data.pagination?.total || response.data.data.length;
            } else {
                throw new Error('Invalid API response structure');
            }

            setProducts(productsData);
            setPagination(prev => ({
                ...prev,
                total: totalCount
            }));

        } catch (error) {
            console.error('Error fetching products:', error);
            message.error('Failed to load products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, pagination.current, pagination.pageSize, refreshKey]);

    // Delete confirmation
    const showDeleteConfirm = (product) => {
        let inputValue = '';

        confirm({
            title: 'Confirm Delete',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Are you sure you want to delete {product.name}?</p>
                    <Input
                        placeholder="Type product name to confirm"
                        onChange={(e) => (inputValue = e.target.value)}
                    />
                </div>
            ),
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                return new Promise((resolve, reject) => {
                    if (inputValue === product.name) {
                        handleDelete(product.product_id).then(resolve).catch(reject);
                    } else {
                        message.error('Product name does not match!');
                        reject();
                    }
                });
            }
        });
    };

    const handleDelete = async (productId) => {
        setDeleteLoadingId(productId);
        try {
            const response = await instance.delete(`http://localhost:8080/products/${productId}`);

            if (response.status === 200) {
                message.success(response.data.message);
                setProducts(prev => prev.filter(p => p.product_id !== productId));
                setPagination(prev => ({
                    ...prev,
                    total: prev.total - 1,
                }));
            }
        } catch (error) {
            console.error('Delete error details:', error);
            if (error.response) {
                const errorMessage = error.response.data?.error || 'Xóa thất bại';
                const errorDetails = error.response.data?.details;
                
                if (error.response.status === 400) {
                    message.error({
                        content: errorMessage,
                        description: errorDetails,
                        duration: 5
                    });
                } else if (error.response.status === 404) {
                    message.error('Không tìm thấy sản phẩm để xóa');
                } else {
                    message.error({
                        content: errorMessage,
                        description: errorDetails || 'Vui lòng thử lại sau',
                        duration: 5
                    });
                }
            } else {
                message.error('Lỗi kết nối đến server');
            }
        } finally {
            setDeleteLoadingId(null);
        }
    };

    const handleEdit = (product) => {
        if (!product) {
            console.error('Invalid product data');
            message.error('Cannot edit: Invalid product data');
            return;
        }

        setEditingProduct(product);
        form.setFieldsValue({
            name: product.name || '',
            description: product.description || '',
            price: product.price ? product.price.toString() : '0',
            stock_quantity: product.stock_quantity ? product.stock_quantity.toString() : '0',
            category: product.category || 'quan_jean',
            url: product.url || ''
        });
        setEditModalOpen(true);
    };

    const handleUpdate = async (values) => {
        try {
            const response = await instance.put(
                `http://localhost:8080/products/${editingProduct.product_id}`,
                {
                    name: values.name,
                    description: values.description || '',
                    price: parseFloat(values.price),
                    stock_quantity: parseInt(values.stock_quantity, 10),
                    category: values.category,
                    url: values.url || editingProduct.url
                }
            );

            if (response.data && response.data.message) {
                message.success(response.data.message);
                fetchProducts(); 
                setRefreshKey(prev => prev + 1);
                setEditModalOpen(false);
                form.resetFields();
            } else {
                message.error('Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            if (error.response) {
                message.error(error.response.data?.error || 'Lỗi từ server');
            } else {
                message.error('Lỗi kết nối server');
            }
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Product Name',
            dataIndex: 'name',
            key: 'name',
            render: text => <span className="font-medium">{text}</span>,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: category => <Tag color="blue">{category}</Tag>,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: price => (
                <span className="font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(price)}
                </span>
            ),
        },
        {
            title: 'Stock',
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            render: quantity => (
                <Tag color={quantity > 0 ? 'green' : 'red'}>
                    {quantity > 0 ? `In stock: ${quantity}` : 'Out of stock'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => showDeleteConfirm(record)}
                        loading={deleteLoadingId === record.product_id}
                    />
                </Space>
            ),
        },
    ];

    // Edit modal
    const editModal = (
        <Modal
            title="Edit Product"
            open={editModalOpen}
            onCancel={() => {
                setEditModalOpen(false);
                form.resetFields();
            }}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdate}
                initialValues={{
                    name: editingProduct?.name || '',
                    description: editingProduct?.description || '',
                    price: editingProduct?.price?.toString() || '0',
                    stock_quantity: editingProduct?.stock_quantity?.toString() || '0',
                    category: editingProduct?.category || 'quan_jean',
                    url: editingProduct?.url || ''
                }}
            >
                <Form.Item
                    name="name"
                    label="Product Name"
                    rules={[{ required: true, message: 'Please input product name!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Price"
                    rules={[{ required: true, message: 'Please input price!' }]}
                >
                    <Input type="number" min={0} step="0.01" />
                </Form.Item>

                <Form.Item
                    name="stock_quantity"
                    label="Stock Quantity"
                    rules={[{ required: true, message: 'Please input stock quantity!' }]}
                >
                    <Input type="number" min={0} step="1" />
                </Form.Item>

                <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true, message: 'Please select category!' }]}
                >
                    <Select
                        placeholder="Danh mục"
                        style={{ width: '100%' }}
                    >
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
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Update
                        </Button>
                        <Button onClick={() => {
                            setEditModalOpen(false);
                            form.resetFields();
                        }}>
                            Cancel
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );

    return (
        <div>
            <Table
                columns={columns}
                dataSource={products.map(p => ({ ...p, key: p.product_id }))}
                rowKey="product_id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: total => `Total ${total} products`,
                }}
                onChange={(newPagination) => {
                    setPagination(newPagination);
                }}
                scroll={{ x: 'max-content' }}
            />
            {editModal}
        </div>
    );
};

export default ProductList;