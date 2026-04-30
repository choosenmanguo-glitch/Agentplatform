import React, { useState } from 'react';
import { 
  Table, Tag, Space, Button, Input, Select, Switch, 
  Tabs, Breadcrumb, Typography, App as AntdApp,
  Badge, Pagination
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  SettingOutlined, 
  ArrowLeftOutlined,
  BarsOutlined,
  EditOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PermissionDrawer from '../components/PermissionDrawer';
import { Resource, VisibilityMode, PermissionLevel } from '../types';

const { Title, Text } = Typography;

// Mock Agent Data
const mockAgents = [
  {
    id: '1',
    name: '智能体平台使用助手',
    alias: '使用手册',
    category: '问知识',
    type: '标准智能体-知识库问答',
    description: '智能体平台的使用助手，解答关于平台功能的各类问题...',
    permission: VisibilityMode.PUBLIC_VISIBLE,
    status: true,
    creator: '演示用户',
    publishTime: '2026-04-21 17:35:47',
  },
  {
    id: '2',
    name: '企业数据分析助手',
    alias: '企业分析',
    category: '问数据',
    type: '标准智能体-智能问数',
    description: '擅长查询、分析山东省内的企业工商信息及经营指标...',
    permission: VisibilityMode.PUBLIC_VISIBLE,
    status: true,
    creator: '演示用户',
    publishTime: '2026-04-21 10:54:34',
  },
  {
    id: '3',
    name: '天气着装建议',
    alias: '天气穿搭',
    category: '默认分类',
    type: '流程智能体-工作流',
    description: '根据具体的天气预报推荐合适的穿搭建议...',
    permission: VisibilityMode.PUBLIC_VISIBLE,
    status: true,
    creator: '演示',
    publishTime: '2026-04-20 18:59:19',
  },
  {
    id: '4',
    name: '制度问答',
    alias: '制度问答',
    category: '问知识',
    type: '标准智能体-知识库问答',
    description: '针对公司规章制度及行政报销流程的相关问答...',
    permission: VisibilityMode.PUBLIC_VISIBLE,
    status: true,
    creator: '演示',
    publishTime: '2026-04-20 18:32:05',
  },
  {
    id: '5',
    name: '区域经济分析',
    alias: '区域经济',
    category: '问数据',
    type: '标准智能体-智能问数',
    description: '对选定区域的宏观经济指标进行多维度的挖掘与对比...',
    permission: VisibilityMode.PUBLIC_VISIBLE,
    status: true,
    creator: '演示',
    publishTime: '2026-04-20 17:19:51',
  },
  {
    id: '6',
    name: '天气着装建议',
    alias: '着装建议',
    category: '默认分类',
    type: '流程智能体-工作流',
    description: '根据今日当地天气情况，推荐搭配方案...',
    permission: VisibilityMode.FULLY_PUBLIC,
    status: true,
    creator: '演示用户',
    publishTime: '2026-04-20 17:15:15',
  },
  {
    id: '7',
    name: '专利问答',
    alias: '专利问答',
    category: '问知识',
    type: '标准智能体-知识库问答',
    description: '关于专利法的相关咨询与问答辅助...',
    permission: VisibilityMode.PUBLIC_VISIBLE,
    status: true,
    creator: '演示',
    publishTime: '2026-04-20 17:03:48',
  },
  {
    id: '8',
    name: '专利数据统计分析',
    alias: '专利统计',
    category: '问数据',
    type: '标准智能体-智能问数',
    description: '连接专利数据库，支持多种专利数据的提取与可视化分析...',
    permission: VisibilityMode.PUBLIC_VISIBLE,
    status: true,
    creator: '演示用户',
    publishTime: '2026-04-17 13:31:04',
  },
  {
    id: '9',
    name: '数据分析助手',
    alias: '问数据',
    category: '问数据',
    type: '标准智能体-数据分析报告',
    description: '上传excel，助手会要求分析数据的结构，并产出详细报告...',
    permission: VisibilityMode.FULLY_PUBLIC,
    status: true,
    creator: '演示用户',
    publishTime: '2026-04-14 15:00:12',
  },
];

const PlazaManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<Resource | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { message } = AntdApp.useApp();

  const handleOpenPermission = (record: any) => {
    // Transform mock agent to Resource type for the drawer
    const resource: Resource = {
      id: record.id,
      name: record.name,
      type: '智能体',
      description: record.description,
      owner: record.creator,
      visibilityMode: record.permission,
      userPermission: PermissionLevel.OWNER,
      createdAt: record.publishTime,
    };
    setSelectedAgent(resource);
    setIsDrawerOpen(true);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '智能体名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: '简称',
      dataIndex: 'alias',
      key: 'alias',
      width: 120,
    },
    {
      title: '智能体分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '智能体类型',
      dataIndex: 'type',
      key: 'type',
      width: 180,
    },
    {
      title: '智能体介绍',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: '权限设置',
      dataIndex: 'permission',
      key: 'permission',
      width: 120,
      render: (mode: VisibilityMode, record: any) => (
        <Button 
          type="link" 
          size="small" 
          onClick={() => handleOpenPermission(record)}
          style={{ padding: 0 }}
        >
          {mode === VisibilityMode.PUBLIC_VISIBLE ? '授权可用' : mode}
        </Button>
      ),
    },
    {
      title: '使用状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (checked: boolean) => <Switch size="small" defaultChecked={checked} />,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 150,
      render: () => (
        <Space size="middle">
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>撤销发布</Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: '智能体管理',
      children: (
        <>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <Space size={12}>
                <Button type="primary" icon={<BarsOutlined />}>排序设置</Button>
                <Select defaultValue="batch" style={{ width: 120 }} options={[{ value: 'batch', label: '批量操作' }]} />
              </Space>
              
              <Space size={12}>
                <Input 
                  placeholder="请输入智能体名称" 
                  prefix={<SearchOutlined />} 
                  style={{ width: 220 }} 
                />
                <Select 
                  placeholder="智能体分类" 
                  style={{ width: 140 }} 
                  allowClear 
                  options={[
                    { value: 'knowledge', label: '问知识' },
                    { value: 'data', label: '问数据' }
                  ]}
                />
                <Select 
                  placeholder="智能体类型" 
                  style={{ width: 140 }} 
                  allowClear 
                  options={[
                    { value: 'standard', label: '标准智能体' },
                    { value: 'workflow', label: '流程智能体' }
                  ]}
                />
                <Select 
                  placeholder="使用状态" 
                  style={{ width: 120 }} 
                  allowClear 
                  options={[
                    { value: 'on', label: '启用' },
                    { value: 'off', label: '禁用' }
                  ]}
                />
                <Button icon={<SearchOutlined />} type="primary" ghost />
                <Button icon={<ReloadOutlined />} />
                <Button icon={<SettingOutlined />} />
              </Space>
            </div>
          </div>

          <Table 
            columns={columns} 
            dataSource={mockAgents} 
            rowKey="id" 
            pagination={false}
            rowSelection={{
              type: 'checkbox',
            }}
            size="middle"
            scroll={{ x: 1500 }}
            style={{ marginTop: '16px' }}
          />
          
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Space size={16}>
              <Text type="secondary">共 16 条</Text>
              <Pagination size="small" total={16} defaultCurrent={1} showSizeChanger />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text type="secondary">跳至</Text>
                <Input style={{ width: 50 }} size="small" defaultValue={2} />
                <Text type="secondary">页</Text>
              </div>
            </Space>
          </div>
        </>
      )
    },
    {
      key: '2',
      label: '智能体分类',
      children: (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <EmptyState title="智能体分类管理" />
        </div>
      )
    }
  ];

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <Header onBack={() => navigate('/')} />
        
        <Tabs defaultActiveKey="1" items={tabItems} style={{ marginTop: '16px' }} />
      </div>

      <PermissionDrawer 
        resource={selectedAgent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        readOnly={true}
      />
    </div>
  );
};

const Header: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
    <Button 
      type="link" 
      icon={<ArrowLeftOutlined />} 
      onClick={onBack} 
      style={{ padding: 0, marginRight: '16px', color: '#1e293b', fontSize: '18px' }}
    />
    <Title level={4} style={{ margin: 0 }}>智能体广场管理</Title>
  </div>
);

const EmptyState: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ color: '#94a3b8' }}>
    <BarsOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
    <p>{title} 开发中...</p>
  </div>
);

export default PlazaManagementPage;
