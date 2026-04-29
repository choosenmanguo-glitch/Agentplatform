import React, { useState } from 'react';
import { 
  Typography, Input, Space, Button, Avatar, Card, Tag
} from 'antd';

const AntdCard = Card as any;
import { 
  PlusOutlined, SearchOutlined, SafetyCertificateOutlined,
  LineChartOutlined, DatabaseOutlined, CodeOutlined,
  NodeIndexOutlined, FileTextOutlined, ShareAltOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { motion } from 'motion/react';
import { Resource, VisibilityMode, PermissionLevel } from '../types';
import { mockResources } from '../mockData';
import PermissionDrawer from '../components/PermissionDrawer';

const { Title, Text, Paragraph } = Typography;

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

export default function ManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenPermission = (res: Resource) => {
    setSelectedResource(res);
    setIsDrawerOpen(true);
  };

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
    <motion.div
      key="management"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <Space size={24}>
          <Title level={4} style={{ margin: 0 }}>资源管理</Title>
          <Input
            placeholder="搜索资源名称、标签或ID..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ width: 320, borderRadius: 8 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} size="large">新建资源</Button>
          <Button icon={<SettingOutlined />} />
        </Space>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: '14px' }}>我管理的资源 ({mockResources.filter(r => r.userPermission === PermissionLevel.OWNER || r.userPermission === PermissionLevel.MANAGE).length})</Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {mockResources
          .filter(res => res.userPermission === PermissionLevel.OWNER || res.userPermission === PermissionLevel.MANAGE)
          .filter(res => {
            const query = searchQuery.toLowerCase();
            return res.name.toLowerCase().includes(query) || 
                   res.description.toLowerCase().includes(query);
          })
          .map(res => (
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

              <div style={{ paddingTop: 16, borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  onClick={() => handleOpenPermission(res)}
                >
                  权限管理
                </Button>
              </div>
            </AntdCard>
          ))}
      </div>

      <PermissionDrawer 
        isOpen={isDrawerOpen} 
        resource={selectedResource} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </motion.div>
  );
}
