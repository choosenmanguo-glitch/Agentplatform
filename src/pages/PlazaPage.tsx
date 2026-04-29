import React, { useState } from 'react';
import dayjs from 'dayjs';
import { 
  Typography, Input, Space, Button, Avatar, Card,
  Tabs, Checkbox, Tag, Modal, Form, DatePicker, App as AntdApp
} from 'antd';

const AntdCard = Card as any;
import { 
  SearchOutlined, SettingOutlined,
  LineChartOutlined, DatabaseOutlined, CodeOutlined,
  NodeIndexOutlined, FileTextOutlined, ShareAltOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Resource, VisibilityMode, PermissionLevel } from '../types';
import { mockResources } from '../mockData';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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

export default function PlazaPage() {
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlazaTab, setActivePlazaTab] = useState<string>('模型');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyingResource, setApplyingResource] = useState<Resource | null>(null);

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
    <motion.div
      key="plaza"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <Space size={24}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} type="text" />
          <Title level={4} style={{ margin: 0 }}>资源广场</Title>
        </Space>
        <Button icon={<SettingOutlined />} />
      </div>

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

            {(res.modelType || res.deploymentMode || res.knowledgeBaseType || res.databaseType) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                {res.modelType && <Tag color="blue" variant="filled" style={{ margin: 0, fontSize: '11px' }}>{res.modelType}</Tag>}
                {res.deploymentMode && <Tag color="cyan" variant="filled" style={{ margin: 0, fontSize: '11px' }}>{res.deploymentMode}</Tag>}
                {res.knowledgeBaseType && <Tag color="purple" variant="filled" style={{ margin: 0, fontSize: '11px' }}>{res.knowledgeBaseType}</Tag>}
                {res.databaseType && <Tag color="orange" variant="filled" style={{ margin: 0, fontSize: '11px' }}>{res.databaseType}</Tag>}
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
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))}
              />
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
    </motion.div>
  );
}
