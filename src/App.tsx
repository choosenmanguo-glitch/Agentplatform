import React, { useState } from 'react';
import { 
  Layout, Menu, Input, Button, Avatar, Space, Badge, 
  Tabs, Card, Tag, Modal, Form, DatePicker,
  Checkbox, Typography, ConfigProvider, App as AntdApp
} from 'antd';

const AntdCard = Card as any;

import { 
  PlusOutlined, SearchOutlined, 
  SettingOutlined,
  LineChartOutlined, DatabaseOutlined,
  CodeOutlined, NodeIndexOutlined, FileTextOutlined,
  ShareAltOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SafetyCertificateOutlined, BookOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'motion/react';
import PermissionDrawer from './components/PermissionDrawer';
import { Resource, VisibilityMode, PermissionLevel } from './types';
import { mockResources } from './mockData';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type Page = 'management' | 'plaza';

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
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  );
}

function AppContent() {
  const { message } = AntdApp.useApp();
  const [currentPage, setCurrentPage] = useState<Page>('management');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlazaTab, setActivePlazaTab] = useState<string>('模型');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyingResource, setApplyingResource] = useState<Resource | null>(null);

  const handleOpenPermission = (res: Resource) => {
    setSelectedResource(res);
    setIsDrawerOpen(true);
  };

  const handleApplyRequest = (res: Resource) => {
    setApplyingResource(res);
    setIsApplyModalOpen(true);
  };

  const submitApply = () => {
    if (applyingResource) {
      setPendingIds(prev => new Set(prev).add(applyingResource.id));
      setIsApplyModalOpen(false);
      setApplyingResource(null);
      message.success('已提交申请，待所有权人审批。');
    }
  };

  const menuItems = [
    { key: 'management', label: '资源管理', icon: <DatabaseOutlined /> },
    { key: 'plaza', label: '资源广场', icon: <BookOutlined /> },
  ];

  const typeIcons: Record<string, React.ReactNode> = {
    '智能体': <LineChartOutlined />,
    '模型': <DatabaseOutlined />,
    '自定义API': <CodeOutlined />,
    '工作流': <NodeIndexOutlined />,
    '知识库': <FileTextOutlined />,
    'MCP': <ShareAltOutlined />,
    '数据源': <DatabaseOutlined />,
    '文件库': <FileTextOutlined />,
    '知识图谱': <SettingOutlined />,
  };

  const plazaTabs = ['模型', '知识库', '工具', '自定义API', 'MCP', '工作流', '数据源', '文件库', '知识图谱'];

  const filteredPlazaResources = mockResources
    .filter(res => res.type === activePlazaTab)
    .filter(res => {
      if (!onlyAvailable) return true;
      return res.userPermission !== PermissionLevel.VISIBLE;
    })
    .filter(res => {
      const query = searchQuery.toLowerCase();
      return res.name.toLowerCase().includes(query) || 
             res.description.toLowerCase().includes(query) ||
             res.owner.toLowerCase().includes(query);
    });

  const getVisibilityBadge = (mode: VisibilityMode) => {
    switch (mode) {
      case VisibilityMode.FULLY_PUBLIC:
        return <Tag color="success">完全公开</Tag>;
      case VisibilityMode.PUBLIC_VISIBLE:
        return <Tag color="processing">公开可见</Tag>;
      case VisibilityMode.FULLY_AUTHORIZED:
        return <Tag color="default">完全授权</Tag>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={260} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>R</div>
          <Title level={5} style={{ margin: 0 }}>资源统一管理</Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          onClick={({ key }) => setCurrentPage(key as Page)}
          items={menuItems}
          style={{ borderRight: 0 }}
        />

      </Sider>

      <Layout>
        <Header style={{ background: 'white', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', height: '64px' }}>
          <Space size={24}>
            <Title level={4} style={{ margin: 0 }}>{currentPage === 'management' ? '资源管理' : '资源广场'}</Title>
            {currentPage === 'management' && (
              <Input
                placeholder="搜索资源名称、标签或ID..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                style={{ width: 320, borderRadius: 8 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </Space>
          <Space>
            {currentPage === 'management' && (
              <Button type="primary" icon={<PlusOutlined />} size="large">新建资源</Button>
            )}
            <Button icon={<SettingOutlined />} />
          </Space>
        </Header>

        <Content style={{ padding: '32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {currentPage === 'management' ? (
              <motion.div
                key="management"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                  <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{ width: '96px', height: '96px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#2563eb', boxShadow: '0 20px 50px rgba(37,99,235,0.1)' }}>
                      <SafetyCertificateOutlined style={{ fontSize: '48px' }} />
                    </div>
                    <Title level={1} style={{ marginBottom: 8 }}>统一资源管理</Title>
                    <Text type="secondary" style={{ fontSize: '16px' }}>管控安全审计 · 共享协作治理</Text>
                  </div>
                  
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<SafetyCertificateOutlined />}
                    onClick={() => handleOpenPermission(mockResources[0])}
                    style={{ height: '72px', padding: '0 64px', borderRadius: '24px', fontSize: '24px', fontWeight: '900', boxShadow: '0 20px 50px rgba(37,99,235,0.3)' }}
                  >
                    权限管理
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="plaza"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Tabs
                  activeKey={activePlazaTab}
                  onChange={setActivePlazaTab}
                  items={plazaTabs.map(tab => ({ key: tab, label: tab }))}
                  style={{ marginBottom: 24 }}
                  tabBarExtraContent={
                    <Input
                      placeholder="搜索资源名称、标签或ID..."
                      prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                      style={{ width: 320, borderRadius: 8 }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  }
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                  <Space>
                    <Checkbox checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)}>
                      <span style={{ fontWeight: 500 }}>仅看我可用的</span>
                    </Checkbox>
                  </Space>
                  <Text type="secondary" style={{ fontSize: '12px' }}>共找到 {filteredPlazaResources.length} 个资源</Text>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                  {filteredPlazaResources.map(res => (
                    <AntdCard 
                      key={res.id}
                      hoverable
                      styles={{ body: { padding: 24, display: 'flex', flexDirection: 'column', height: '100%' } }}
                      style={{ borderRadius: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                        <Avatar 
                           shape="square" 
                           size={48} 
                           icon={typeIcons[res.type]} 
                           style={{ backgroundColor: '#f8fafc', color: '#2563eb', border: '1px solid #f1f5f9' }}
                        />
                        {getVisibilityBadge(res.visibilityMode)}
                      </div>
                      <Title level={4} style={{ marginBottom: 8 }} ellipsis={{ tooltip: res.description }}>{res.name}</Title>
                      <div style={{ height: '44px', marginBottom: 16 }}>
                         <Paragraph type="secondary" ellipsis={{ rows: 2 }}>{res.description}</Paragraph>
                      </div>

                      {/* 个性化信息展示 */}
                      {(res.modelType || res.deploymentMode || res.knowledgeBaseType || res.databaseType) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                          {res.modelType && <Tag color="blue" bordered={false} style={{ margin: 0, fontSize: '11px' }}>{res.modelType}</Tag>}
                          {res.deploymentMode && <Tag color="cyan" bordered={false} style={{ margin: 0, fontSize: '11px' }}>{res.deploymentMode}</Tag>}
                          {res.knowledgeBaseType && <Tag color="purple" bordered={false} style={{ margin: 0, fontSize: '11px' }}>{res.knowledgeBaseType}</Tag>}
                          {res.databaseType && <Tag color="orange" bordered={false} style={{ margin: 0, fontSize: '11px' }}>{res.databaseType}</Tag>}
                        </div>
                      )}
                      
                      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                          <Space size={4}>
                            <Avatar size={16} style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '8px' }}>
                              {res.owner.substring(0, 1)}
                            </Avatar>
                            {res.owner}
                          </Space>
                          <span>更新于 {res.createdAt}</span>
                        </div>
                        
                        <div style={{ paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                          {res.userPermission !== PermissionLevel.VISIBLE ? (
                            <Button block disabled icon={<CheckCircleOutlined />} size="large">已获授权</Button>
                          ) : pendingIds.has(res.id) ? (
                            <Button block disabled icon={<ClockCircleOutlined />} size="large">审核中</Button>
                          ) : (
                            <Button type="primary" block size="large" onClick={() => handleApplyRequest(res)}>申请使用</Button>
                          )}
                        </div>
                      </Space>
                    </AntdCard>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Content>
      </Layout>

      <Modal
        title="权限申请"
        open={isApplyModalOpen}
        onCancel={() => setIsApplyModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsApplyModalOpen(false)} size="large">取消</Button>,
          <Button key="submit" type="primary" onClick={submitApply} size="large">提交申请</Button>
        ]}
        centered
        width={480}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center' }}>
             <Avatar shape="square" size={40} icon={applyingResource ? typeIcons[applyingResource.type] : null} style={{ backgroundColor: 'white', color: '#2563eb' }} />
             <div>
               <div style={{ fontWeight: 'bold' }}>{applyingResource?.name}</div>
               <Text type="secondary" style={{ fontSize: '12px' }}>所有者: {applyingResource?.owner}</Text>
             </div>
          </div>
        </div>

        <Form layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item label="预期失效日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label=" ">
              <Checkbox>永久有效</Checkbox>
            </Form.Item>
          </div>
          <Form.Item label="申请理由">
            <TextArea rows={4} placeholder="请输入申请该资源的使用场景或理由..." />
          </Form.Item>
        </Form>
      </Modal>

      <PermissionDrawer 
        isOpen={isDrawerOpen} 
        resource={selectedResource} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </Layout>
  );
}
