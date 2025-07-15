import React, { useState } from 'react';
import { BackTop } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';

const BackToTopButton = () => {
  const [visible, setVisible] = useState(true);

  const handleClick = () => {
    setVisible(false);
    // Allow scrolling to top, then reset after short delay
    setTimeout(() => setVisible(true), 800);
  };

  return (
    visible && (
      <BackTop visibilityHeight={200}>
        <div
          onClick={handleClick}
          style={{
            height: 48,
            width: 48,
            borderRadius: '50%',
            backgroundColor: 'orange',
            color: 'black',
            textAlign: 'center',
            lineHeight: '48px',
            fontSize: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: 0.5,
            position: 'fixed',
            right: 24,
            bottom: 24,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <ArrowUpOutlined style={{ fontSize: 20 }} />
        </div>
      </BackTop>
    )
  );
};

export default BackToTopButton;
