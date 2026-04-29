import React from 'react';
import { 
  Layout, Menu, Typography, ConfigProvider, App as AntdApp
} from 'antd';
import { 
  DatabaseOutlined, BookOutlined
} from '@ant-design/icons';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ManagementPage from './pages/ManagementPage';
import PlazaPage from './pages/PlazaPage';

const { Sider, Content } = Layout;
const { Title } = Typography;

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 12,
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

function AppLayout() {
  const location = useLocation();
  const currentPath = location.pathname === '/' ? '/management' : location.pathname;

  const menuItems = [
    { 
      key: '/management', 
      label: <Link to="/management">资源管理</Link>, 
      icon: <DatabaseOutlined /> 
    },
    { 
      key: '/plaza', 
      label: <Link to="/plaza">资源广场</Link>, 
      icon: <BookOutlined /> 
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={260} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>R</div>
          <Title level={5} style={{ margin: 0 }}>资源统一管理</Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentPath]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Content style={{ padding: '32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<ManagementPage />} />
            <Route path="/management" element={<ManagementPage />} />
            <Route path="/plaza" element={<PlazaPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
