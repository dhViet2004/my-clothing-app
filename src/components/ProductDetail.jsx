import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ProductCard from './ProductCard';

const ProductDetail = () => {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => window.history.back()}
          style={{ marginRight: 16 }}
        />
        <h2 style={{ margin: 0 }}>Chi tiết sản phẩm</h2>
      </div>
      <ProductCard isDetailView />
    </div>
  );
};

export default ProductDetail;