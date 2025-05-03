import React, { useState } from 'react';
import { Radio, Form, Input, Button, message, Modal, Typography, Space, Divider } from 'antd';
import { BankOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const { Text, Title } = Typography;

const PaymentMethod = ({ onPaymentConfirm, totalAmount }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, transferGuestCartToDB } = useCart();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');

    const handleSubmit = async (values) => {
        if (!user) {
            setIsModalVisible(true);
            return;
        }

        try {
            const selectedPaymentMethod = values.paymentMethod;
            console.log('Selected payment method:', selectedPaymentMethod);
            await onPaymentConfirm(selectedPaymentMethod, values.transactionId);
        } catch (error) {
            console.error('Error processing payment:', error);
            message.error('Có lỗi xảy ra khi xử lý thanh toán');
        }
    };

    const handleLoginAndContinue = () => {
        setIsModalVisible(false);
        navigate('/login', { 
            state: { 
                from: '/checkout',
                onLoginSuccess: async () => {
                    await transferGuestCartToDB();
                    const values = form.getFieldsValue();
                    await onPaymentConfirm(values.paymentMethod, values.transactionId);
                }
            }
        });
    };

    const bankAccounts = [
        {
            bank: 'Vietcombank',
            accountNumber: '1234567890',
            accountName: 'CÔNG TY TNHH YOUR BRAND',
            branch: 'Chi nhánh Hà Nội'
        },
        {
            bank: 'Techcombank',
            accountNumber: '0987654321',
            accountName: 'CÔNG TY TNHH YOUR BRAND',
            branch: 'Chi nhánh Hà Nội'
        }
    ];

    return (
        <>
            <div className="mb-4">
                <Title level={4}>Tổng tiền: {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(totalAmount)}</Title>
            </div>

            <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                initialValues={{ paymentMethod: 'cod' }}
            >
                <Form.Item
                    name="paymentMethod"
                    label="Phương thức thanh toán"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                >
                    <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)}>
                        <Space direction="vertical" className="w-full">
                            <Radio value="cod" className="w-full">
                                <div className="flex items-center">
                                    <CreditCardOutlined className="mr-2" />
                                    <div>
                                        <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                                        <div className="text-gray-500 text-sm">Thanh toán bằng tiền mặt khi nhận hàng</div>
                                    </div>
                                </div>
                            </Radio>
                            <Radio value="bank_transfer" className="w-full">
                                <div className="flex items-center">
                                    <BankOutlined className="mr-2" />
                                    <div>
                                        <div className="font-medium">Chuyển khoản ngân hàng</div>
                                        <div className="text-gray-500 text-sm">Chuyển khoản trực tiếp vào tài khoản ngân hàng</div>
                                    </div>
                                </div>
                            </Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>

                {paymentMethod === 'bank_transfer' && (
                    <>
                        <div className="mb-4">
                            <Text strong>Thông tin chuyển khoản:</Text>
                            {bankAccounts.map((account, index) => (
                                <div key={index} className="mt-2 p-3 border rounded">
                                    <Text strong>{account.bank}</Text>
                                    <div>Số tài khoản: {account.accountNumber}</div>
                                    <div>Chủ tài khoản: {account.accountName}</div>
                                    <div>Chi nhánh: {account.branch}</div>
                                </div>
                            ))}
                        </div>

                        <Form.Item
                            name="transactionId"
                            label="Mã giao dịch"
                            rules={[{ required: true, message: 'Vui lòng nhập mã giao dịch' }]}
                        >
                            <Input placeholder="Nhập mã giao dịch chuyển khoản" />
                        </Form.Item>
                    </>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Xác nhận thanh toán
                    </Button>
                </Form.Item>
            </Form>

            <Modal
                title="Đăng nhập"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key="login" type="primary" onClick={handleLoginAndContinue}>
                        Đăng nhập
                    </Button>
                ]}
            >
                <p>Vui lòng đăng nhập để tiếp tục thanh toán</p>
            </Modal>
        </>
    );
};

export default PaymentMethod; 