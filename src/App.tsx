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
import SmartDataQueryPage from './pages/SmartDataQueryPage';
import PlazaManagementPage from './pages/PlazaManagementPage';
import TianshuConnectionPage from './pages/TianshuConnectionPage';
import HomePage from './pages/HomePage';

const { Content } = Layout;
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
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/management" element={<ManagementPage />} />
            <Route path="/plaza" element={<PlazaPage />} />
            <Route path="/smart-query" element={<SmartDataQueryPage />} />
            <Route path="/plaza-management" element={<PlazaManagementPage />} />
            <Route path="/tianshu-connection" element={<TianshuConnectionPage />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}
