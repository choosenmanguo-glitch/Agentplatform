import React from 'react';
import { Card, Typography, Space, Button, Breadcrumb } from 'antd';
const AntdCard = Card as any;
import { 
  SafetyCertificateOutlined, 
  GlobalOutlined, 
  RobotOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: '资源权限管理',
      description: '配置数据资源访问控制、角色权限映射及细粒度安全逻辑',
      icon: <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      path: '/management',
      color: '#e6f7ff'
    },
    {
      title: '资源广场',
      description: '探索与搜索企业内共享的数据模型、报表及智能体资源',
      icon: <GlobalOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      path: '/plaza',
      color: '#f6ffed'
    },
    {
      title: '智能体广场管理',
      description: '统一管理智能体分类、权限策略及上下架状态，维护广场生态',
      icon: <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      path: '/plaza-management',
      color: '#f9f0ff'
    },
    {
      title: '智能问数配置',
      description: '智能体语义优化，包括表描述 AI 优化、批量治理及问数逻辑配置',
      icon: <RobotOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
      path: '/smart-query',
      color: '#fff7e6'
    }
  ];

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <Title level={2}>智能体平台V3.1.0需求列表</Title>
        <Text type="secondary">欢迎来到智能管理中心，请选择您需要执行的配置任务</Text>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AntdCard 
              hoverable 
              onClick={() => navigate(item.path)}
              styles={{ body: { padding: '20px' } }}
              style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space size={20}>
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    background: item.color, 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>{item.title}</Title>
                    <Text type="secondary">{item.description}</Text>
                  </div>
                </Space>
                <RightOutlined style={{ color: '#bfbfbf' }} />
              </div>
            </AntdCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
