import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import ProductCard from '../components/ProductCard';
import { Row, Col, Typography, Skeleton } from 'antd';
import axios from 'axios';
import { Button } from 'antd';  // Thêm dòng này

const { Title } = Typography;

function Home() {
    const bannerImages = [
        { id: 1, src: '/images/banner1.jpg', alt: 'Banner 1', link: '/collection1' },
        { id: 2, src: '/images/banner2.jpg', alt: 'Banner 2', link: '/collection2' },
        { id: 3, src: '/images/banner3.jpg', alt: 'Banner 3', link: '/collection3' },
        { id: 4, src: '/images/banner4.jpg', alt: 'Banner 4', link: '/collection4' }
    ];

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch sản phẩm từ API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/products', {
                    params: {
                        page: 1,
                        pageSize: 8 // Lấy 8 sản phẩm cho trang chủ
                    }
                });
                
                // Xử lý response theo API của bạn
                const productsData = response.data.data || response.data || [];
                setProducts(productsData);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="flex flex-col">
            {/* Banner Slider */}
            <div className="w-full relative">
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                        el: '.swiper-pagination',
                        type: 'bullets',
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    className="h-64 md:h-96"
                >
                    {bannerImages.map((banner) => (
                        <SwiperSlide key={banner.id}>
                            <Link to={banner.link} className="block h-full w-full">
                                <img
                                    src={banner.src}
                                    alt={banner.alt}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-banner.jpg';
                                    }}
                                />
                            </Link>
                        </SwiperSlide>
                    ))}
                    
                    <div className="swiper-button-prev !text-white !w-10 !h-10 !rounded-full !bg-black/50 after:!text-xl"></div>
                    <div className="swiper-button-next !text-white !w-10 !h-10 !rounded-full !bg-black/50 after:!text-xl"></div>
                    <div className="swiper-pagination !bottom-2 [&>.swiper-pagination-bullet-active]:!bg-blue-500"></div>
                </Swiper>
            </div>

            {/* Product Section */}
            <div className="container mx-auto px-4 py-8">
                <Title level={2} className="text-center mb-8">Sản Phẩm Nổi Bật</Title>
                
                {loading ? (
                    <Row gutter={[16, 16]}>
                        {[...Array(4)].map((_, index) => (
                            <Col key={index} xs={24} sm={12} md={8} lg={6}>
                                <Skeleton active />
                            </Col>
                        ))}
                    </Row>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {products.map(product => (
                            <Col key={product.product_id} xs={24} sm={12} md={8} lg={6}>
                                <ProductCard 
                                    product={product}
                                    // Bạn có thể thêm các props khác nếu cần
                                    // onEdit={handleEdit}
                                    // onDelete={handleDelete}
                                />
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Xem thêm sản phẩm
                <div className="text-center mt-8">
                    <Link to="/products">
                        <Button type="primary" size="large">
                            Xem Tất Cả Sản Phẩm
                        </Button>
                    </Link>
                </div> */}
            </div>
        </div>
    );
}

export default Home;