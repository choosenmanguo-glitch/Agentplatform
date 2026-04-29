import React, { useState } from 'react';
import dayjs from 'dayjs';
import { 
  Drawer, Tabs, Table, Select, Input, Button, Avatar, 
  Space, Tag, Badge, Modal, Form, DatePicker,
  Typography, Empty, Tooltip, Alert, Popconfirm,
  ConfigProvider, Radio, Card, App as AntdApp, Dropdown, Menu, Checkbox, Flex
} from 'antd';
import { 
  SettingOutlined, UserOutlined, FileTextOutlined, 
  HistoryOutlined, SafetyCertificateOutlined, SearchOutlined,
  UserAddOutlined, DeleteOutlined, SwapOutlined,
  CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined,
  InfoCircleOutlined, UnlockOutlined, EyeOutlined,
  LockOutlined, ExclamationCircleOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Resource, VisibilityMode, PermissionLevel, 
  PermissionMember, ApprovalRequest, ObjectType 
} from '../types';
import { mockMembers, mockApprovals, mockAuditLogs } from '../mockData';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AntdCard = Card as any;

interface PermissionDrawerProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionDrawer(props: PermissionDrawerProps) {
  return (
    <AntdApp>
      <PermissionDrawerContent {...props} />
    </AntdApp>
  );
}

function PermissionDrawerContent({ resource, isOpen, onClose }: PermissionDrawerProps) {
  const { message } = AntdApp.useApp();
  const [activeTab, setActiveTab] = useState('settings');
  const [mode, setMode] = useState<VisibilityMode>(resource?.visibilityMode || VisibilityMode.PUBLIC_VISIBLE);
  const [members, setMembers] = useState<PermissionMember[]>(mockMembers);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(mockApprovals);
  
  // Filtering state for members
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [permissionLevelFilter, setPermissionLevelFilter] = useState<PermissionLevel | null>(null);
  const [objectTypeFilter, setObjectTypeFilter] = useState<ObjectType | null>(null);
  
  // Selection state for batch operations
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // Approval state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalConfig, setApprovalConfig] = useState({
    level: PermissionLevel.USE,
    expiry: ''
  });

  // Record detail state
  const [selectedRecord, setSelectedRecord] = useState<ApprovalRequest | null>(null);
  
  // Add object modal state
  const [isAddObjectModalOpen, setIsAddObjectModalOpen] = useState(false);
  const [selectedObjects, setSelectedObjects] = useState<any[]>([]);
  const [addObjectSearch, setAddObjectSearch] = useState('');

  // Batch permission modal state
  const [isBatchPermissionModalOpen, setIsBatchPermissionModalOpen] = useState(false);
  const [batchPermissionLevel, setBatchPermissionLevel] = useState<PermissionLevel>(PermissionLevel.USE);

  // Batch expiry modal state
  const [isBatchExpiryModalOpen, setIsBatchExpiryModalOpen] = useState(false);
  const [batchExpiryDate, setBatchExpiryDate] = useState<string | null>(null);
  const [isPermanent, setIsPermanent] = useState(false);

  // Transfer state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSearch, setTransferSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [transferConfirmLogin, setTransferConfirmLogin] = useState('');

  const potentialRecipients = [
    { name: '李四', dept: '系统架构部', login: 'lisi_arch', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
    { name: '王五', dept: '产品研发部', login: 'wangwu_dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Brian' },
    { name: '赵六', dept: '运营推广部', login: 'zhaoliu_ops', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George' },
  ];

  const handleAddMember = (login: string) => {
    const user = potentialRecipients.find(u => u.login === login);
    if (user) {
      const newMember: PermissionMember = {
        id: Math.random().toString(36).substring(2, 9),
        name: user.name,
        role: user.dept,
        department: user.dept,
        objectType: ObjectType.PERSON,
        level: PermissionLevel.USE,
        avatar: user.avatar,
      };
      setMembers(prev => [...prev, newMember]);
    }
  };

  const handleBatchLevelChange = (level: PermissionLevel) => {
    setMembers(prev => prev.map(m => selectedRowKeys.includes(m.id) ? { ...m, level } : m));
    message.success(`已批量修改 ${selectedRowKeys.length} 个对象的权限级别为：${level}`);
    setSelectedRowKeys([]);
  };

  const handleBatchExpiryChange = (date: string) => {
    setMembers(prev => prev.map(m => selectedRowKeys.includes(m.id) ? { ...m, expiryDate: date } : m));
    message.success(`已批量设置 ${selectedRowKeys.length} 个对象的到期日期`);
    setSelectedRowKeys([]);
  };

  const handleApprove = (id: string) => {
    const request = approvals.find(a => a.id === id);
    if (!request) return;

    setApprovals(prev => prev.map(a => a.id === id ? { 
      ...a, 
      status: '通过',
      approvedLevel: approvalConfig.level,
      approvedExpiry: approvalConfig.expiry || '永久有效'
    } : a));
    
    const newMember: PermissionMember = {
      id: Math.random().toString(36).substring(2, 9),
      name: request.userName,
      avatar: request.userAvatar,
      role: '申请人',
      objectType: ObjectType.PERSON,
      level: approvalConfig.level,
      expiryDate: approvalConfig.expiry || undefined
    };
    
    setMembers(prev => [...prev, newMember]);
    message.success(`已通过 ${request.userName} 的申请`);
  };

  const handleReject = () => {
    if (!rejectingRequestId) return;
    setApprovals(prev => prev.map(a => a.id === rejectingRequestId ? { 
      ...a, 
      status: '驳回',
      rejectReason: rejectReason || '未填写原因'
    } : a));
    setRejectingRequestId(null);
    setRejectReason('');
    message.info('已驳回申请');
  };

  const handleBatchDelete = () => {
    setMembers(prev => prev.filter(m => !selectedRowKeys.includes(m.id)));
    setSelectedRowKeys([]);
    message.success('已批量移除成员');
  };

  const columns = [
    {
      title: '授权对象',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: PermissionMember) => {
        if (record.objectType === ObjectType.DEPARTMENT || record.objectType === ObjectType.POSITION) {
          return <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.name}</span>;
        }
        return (
          <Space>
            <Avatar src={record.avatar} size="small" />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{record.department || record.role}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: '对象类型',
      dataIndex: 'objectType',
      key: 'objectType',
      render: (type: ObjectType) => {
        const colorMap = {
          [ObjectType.PERSON]: 'blue',
          [ObjectType.DEPARTMENT]: 'cyan',
          [ObjectType.POSITION]: 'orange',
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      }
    },
    {
      title: '权限级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: PermissionLevel, record: PermissionMember) => (
        <Select
          defaultValue={level}
          disabled={level === PermissionLevel.OWNER}
          variant="borderless"
          style={{ width: 100 }}
          onChange={(newLevel) => {
            setMembers(prev => prev.map(m => m.id === record.id ? { ...m, level: newLevel } : m));
            message.success('权限级别已更新');
          }}
          options={Object.values(PermissionLevel)
            .filter(l => l !== PermissionLevel.OWNER || level === PermissionLevel.OWNER)
            .map(lv => ({ value: lv, label: lv }))}
        />
      ),
    },
    {
      title: '到期时间',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string, record: PermissionMember) => {
        const isOwner = record.level === PermissionLevel.OWNER;
        if (isOwner) return <Text type="secondary">-</Text>;
        
        const now = dayjs().startOf('day');
        const expiry = date ? dayjs(date) : null;
        const isExpired = expiry && expiry.isBefore(now);

        return (
          <Tooltip title={isExpired ? `已于 ${date} 到期` : date ? `到期时间: ${date}` : '永久有效'}>
            <DatePicker
              variant="borderless"
              placeholder={isExpired ? "已过期" : "永久有效"}
              value={date ? dayjs(date) : null}
              status={isExpired ? 'error' : undefined}
              disabledDate={(current) => {
                return current && current.isBefore(dayjs().startOf('day'));
              }}
              onChange={(_, dateString) => {
                setMembers(prev => prev.map(m => m.id === record.id ? { ...m, expiryDate: dateString as string } : m));
                message.success('有效期已更新');
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: PermissionMember) => (
        <Space size={0}>
          {record.level === PermissionLevel.OWNER ? (
            <Tooltip title="所有权转移">
              <Button 
                type="text" 
                icon={<SwapOutlined />} 
                onClick={() => setIsTransferModalOpen(true)}
                danger
              />
            </Tooltip>
          ) : (
            <Popconfirm
              title="确认移除成员？"
              description="该操作将立即取消该用户的资源使用权限。"
              onConfirm={() => {
                setMembers(prev => prev.filter(m => m.id !== record.id));
                message.success('已移除成员');
              }}
              okText="确认"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (!resource) return null;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 8,
        },
      }}
    >
      <Drawer
        title="权限管理"
        placement="right"
        onClose={onClose}
        open={isOpen}
        footer={
          activeTab === 'settings' ? (
            <div style={{ textAlign: 'right' }}>
              <Button type="primary" size="large" onClick={() => {
                message.success('全局策略已更新');
                onClose();
              }}>
                保存
              </Button>
            </div>
          ) : null
        }
        styles={{
          header: { borderBottom: '1px solid #f0f0f0', padding: '20px 24px' },
          body: { padding: 0, display: 'flex', flexDirection: 'column' },
          footer: { borderTop: '1px solid #f0f0f0', padding: '16px 24px' },
          wrapper: { width: 800 }
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="permission-tabs"
          style={{ height: '100%' }}
          tabBarStyle={{ padding: '0 24px', margin: 0, background: 'white' }}
          items={[
            {
              key: 'settings',
              label: (
                <Space>
                  <SettingOutlined />
                  全局公开策略
                </Space>
              ),
              children: (
                <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100%' }}>
                  <Space orientation="vertical" size={24} style={{ width: '100%' }}>
                    <Alert
                      title="全局公开策略决定了资源在广场中的可见性。设置后立即对全平台用户生效。"
                      type="info"
                      showIcon
                    />
                    
                    <Radio.Group 
                      value={mode} 
                      onChange={(e) => setMode(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
                        {[
                          { 
                            mode: VisibilityMode.FULLY_PUBLIC, 
                            icon: <UnlockOutlined style={{ fontSize: '20px' }} />, 
                            title: '完全公开', 
                            desc: '广场无条件展示，全员默认拥有“使用权”。',
                            color: '#52c41a' 
                          },
                          { 
                            mode: VisibilityMode.PUBLIC_VISIBLE, 
                            icon: <EyeOutlined style={{ fontSize: '20px' }} />, 
                            title: '公开可见，授权可用', 
                            desc: '广场公开展示，全员默认“仅可见”，需申请并审批通过后方可使用。',
                            color: '#2563eb'
                          },
                          { 
                            mode: VisibilityMode.FULLY_AUTHORIZED, 
                            icon: <LockOutlined style={{ fontSize: '20px' }} />, 
                            title: '完全授权', 
                            desc: '仅对白名单用户可见，对其他用户绝对隐藏（不可搜索）。',
                            color: '#475569'
                          },
                        ].map(item => (
                          <Radio.Button 
                            key={item.mode} 
                            value={item.mode} 
                            style={{ 
                              height: 'auto', 
                              padding: '20px', 
                              borderRadius: '12px', 
                              border: `1px solid ${mode === item.mode ? '#2563eb' : '#e2e8f0'}`,
                              width: '100%',
                              display: 'block',
                              background: 'white'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                              <div style={{ padding: '10px', background: item.color, borderRadius: '8px', color: 'white' }}>
                                {item.icon}
                              </div>
                              <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>{item.title}</div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', whiteSpace: 'normal' }}>{item.desc}</div>
                              </div>
                            </div>
                          </Radio.Button>
                        ))}
                      </Space>
                    </Radio.Group>


                  </Space>
                </div>
              )
            },
            {
              key: 'members',
              label: (
                <Space>
                  <UserOutlined />
                  授权与人员
                </Space>
              ),
              children: (
                <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100%' }}>
                  <Space orientation="vertical" style={{ width: '100%' }} size={24}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space size={12}>
                        <Input
                          placeholder="搜索已添加对象..."
                          prefix={<SearchOutlined />}
                          style={{ width: 200 }}
                          value={memberSearchQuery}
                          onChange={e => setMemberSearchQuery(e.target.value)}
                        />
                        <Select
                          placeholder="权限级别"
                          allowClear
                          style={{ width: 120 }}
                          onChange={setPermissionLevelFilter}
                          options={Object.values(PermissionLevel).map(v => ({ label: v, value: v }))}
                        />
                        <Select
                          placeholder="对象类型"
                          allowClear
                          style={{ width: 120 }}
                          onChange={setObjectTypeFilter}
                          options={Object.values(ObjectType).map(v => ({ label: v, value: v }))}
                        />
                      </Space>
                      <Button 
                        type="primary" 
                        size="large" 
                        icon={<UserAddOutlined />} 
                        onClick={() => setIsAddObjectModalOpen(true)}
                        style={{ borderRadius: '8px' }}
                      >
                        添加授权对象
                      </Button>
                    </div>

                    {selectedRowKeys.length > 0 && (
                      <Alert
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>已选择 {selectedRowKeys.length} 项</span>
                            <Space size={12}>
                              <Button size="small" onClick={() => setIsBatchPermissionModalOpen(true)}>批量修改权限</Button>
                              <Button size="small" onClick={() => setIsBatchExpiryModalOpen(true)}>批量设置到期日期</Button>
                              <Popconfirm
                                title="批量移除确认"
                                description={`确认要移除选中的 ${selectedRowKeys.length} 个对象吗？`}
                                onConfirm={handleBatchDelete}
                                okText="确认"
                                cancelText="取消"
                                okButtonProps={{ danger: true }}
                              >
                                <Button size="small" danger>批量移除</Button>
                              </Popconfirm>
                            </Space>
                          </div>
                        }
                        type="info"
                      />
                    )}

                    <Table
                      rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        getCheckboxProps: (record) => ({
                          disabled: record.level === PermissionLevel.OWNER,
                        }),
                      }}
                      columns={columns}
                      dataSource={members.filter(m => {
                        const matchesSearch = m.name.toLowerCase().includes(memberSearchQuery.toLowerCase());
                        const matchesPermission = !permissionLevelFilter || m.level === permissionLevelFilter;
                        const matchesType = !objectTypeFilter || m.objectType === objectTypeFilter;
                        return matchesSearch && matchesPermission && matchesType;
                      })}
                      rowKey="id"
                      pagination={false}
                      style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}
                    />
                  </Space>
                </div>
              )
            },
            {
              key: 'approvals',
              label: (
                <Badge count={approvals.filter(a => a.status === '待处理').length} offset={[10, 0]}>
                  <Space style={{ paddingRight: 8 }}>
                    <FileTextOutlined />
                    使用申请
                  </Space>
                </Badge>
              ),
              children: (
                <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100%' }}>
                   <Space orientation="vertical" style={{ width: '100%' }} size={32}>
                      <section>
                         <Title level={5} style={{ borderLeft: '4px solid #2563eb', paddingLeft: '8px', marginBottom: '16px' }}>
                            待处理申请
                         </Title>
                         <div>
                            {approvals.filter(a => a.status === '待处理').length === 0 ? (
                               <Empty description="暂无待处理申请" />
                            ) : (
                               approvals.filter(a => a.status === '待处理').map((item: ApprovalRequest) => (
                                 <AntdCard key={item.id} styles={{ body: { padding: 24 } }} style={{ marginBottom: 16, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                     <Space>
                                       <Avatar src={item.userAvatar} size="large" />
                                       <div>
                                         <div style={{ fontWeight: 'bold' }}>{item.userName}</div>
                                         <Text type="secondary" style={{ fontSize: '11px' }}>
                                           <CalendarOutlined /> 提交于 {item.submitTime}
                                         </Text>
                                       </div>
                                     </Space>
                                     <Tag color="gold">等待审批</Tag>
                                   </div>
                                   <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', fontStyle: 'italic', color: '#64748b', marginBottom: 24, fontSize: '13px' }}>
                                     “{item.reason}”
                                   </div>
                                   
                                   <Form layout="vertical" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                       <Form.Item label="赋予权限级别">
                                         <Select 
                                           defaultValue={PermissionLevel.USE}
                                           onChange={(v) => setApprovalConfig(prev => ({ ...prev, level: v }))}
                                           options={[
                                             { value: PermissionLevel.USE, label: '使用权 (默认)' },
                                             { value: PermissionLevel.MANAGE, label: '管理权' }
                                           ]}
                                         />
                                       </Form.Item>
                                       <Form.Item label="设定失效日期">
                                         <DatePicker 
                                            style={{ width: '100%' }} 
                                            disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))}
                                            onChange={(_, s) => setApprovalConfig(prev => ({ ...prev, expiry: s as string }))} 
                                          />
                                       </Form.Item>
                                     </div>
                                   </Form>
    
                                   <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                     <Space>
                                       <Button onClick={() => setRejectingRequestId(item.id)}>驳回</Button>
                                       <Button type="primary" onClick={() => handleApprove(item.id)}>通过并授权</Button>
                                     </Space>
                                   </div>
                                 </AntdCard>
                               ))
                            )}
                         </div>
                      </section>

                      <section>
                         <Title level={5} style={{ borderLeft: '4px solid #94a3b8', paddingLeft: '8px', marginBottom: '16px' }}>
                            审批记录 (历史)
                         </Title>
                         <Table
                            columns={[
                              { title: '申请人', dataIndex: 'userName', key: 'userName', render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span> },
                              { title: '申请时间', dataIndex: 'submitTime', key: 'submitTime', render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text> },
                              { 
                                title: '状态', 
                                dataIndex: 'status', 
                                key: 'status',
                                render: (status) => (
                                  <Tag color={status === '通过' ? 'success' : 'error'} icon={status === '通过' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                                    {status}
                                  </Tag>
                                )
                              },
                              { 
                                title: '操作', 
                                key: 'detail', 
                                align: 'right',
                                render: (_, record) => <Button type="link" onClick={() => setSelectedRecord(record)}>详情</Button> 
                              }
                            ]}
                            dataSource={approvals.filter(a => a.status !== '待处理')}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}
                          />
                      </section>
                   </Space>
                </div>
              )
            },
            {
              key: 'audit',
              label: (
                <Space>
                  <HistoryOutlined />
                  权限变更记录
                </Space>
              ),
              children: (
                <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100%' }}>
                  <Space orientation="vertical" style={{ width: '100%' }} size={24}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                       <Space size={12}>
                          <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px' }}>
                            <HistoryOutlined style={{ color: '#2563eb' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>权限变更流水</div>
                            <Text type="secondary" style={{ fontSize: '10px' }}>近 30 天内所有治理操作均已归档</Text>
                          </div>
                       </Space>
                       <Button icon={<FileTextOutlined />}>导出历史记录</Button>
                    </div>

                    <div>
                       {mockAuditLogs
                        .filter(log => !log.action.includes('提交使用申请') && !log.action.includes('审批驳回'))
                        .map(log => (
                         <div key={log.id} style={{ position: 'relative', paddingLeft: '40px', marginBottom: '24px' }}>
                           <div style={{ 
                             position: 'absolute', 
                             left: '14px', 
                             top: '10px', 
                             width: '12px', 
                             height: '12px', 
                             borderRadius: '50%', 
                             background: log.action.includes('强制') || log.action.includes('驳回') ? '#ef4444' : log.action.includes('批量') ? '#f59e0b' : '#2563eb',
                             zIndex: 2,
                             border: '2px solid white',
                             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                           }} />
                           <div style={{ 
                             position: 'absolute', 
                             left: '19px', 
                             top: '22px', 
                             bottom: '-24px', 
                             width: '2px', 
                             background: '#e2e8f0',
                             zIndex: 1
                           }} />
                           
                           <AntdCard 
                             className="audit-log-card" 
                             styles={{ body: { padding: '20px' } }} 
                             style={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}
                           >
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                               <Space>
                                 <span style={{ fontWeight: '900', color: '#1e293b' }}>{log.operator}</span>
                                 <Tag color={
                                   log.action.includes('添加') || log.action.includes('通过') ? 'success' :
                                   log.action.includes('移除') || log.action.includes('驳回') ? 'error' :
                                   log.action.includes('修改') || log.action.includes('变更') ? 'processing' : 'default'
                                 }>
                                   {log.action}
                                 </Tag>
                               </Space>
                               <Text type="secondary" style={{ fontSize: '10px' }}>{log.time}</Text>
                             </div>
                             <div style={{ 
                               padding: '12px 16px', 
                               background: log.action.includes('驳回') ? '#fff1f0' : log.action.includes('通过') ? '#f6ffed' : '#f8fafc',
                               borderRadius: '12px',
                               fontSize: '14px',
                               color: '#475569',
                               border: '1px solid #f1f5f9'
                             }}>
                               {log.detail}
                             </div>
                           </AntdCard>
                         </div>
                       ))}
                    </div>
                  </Space>
                </div>
              )
            }
          ]}
        />

        {/* Modal: Transfer Ownership */}
        <Modal
          title="所有权转移"
          open={isTransferModalOpen}
          onCancel={() => {
            setIsTransferModalOpen(false);
            setSelectedRecipient(null);
            setTransferConfirmLogin('');
          }}
          footer={[
            <Button key="back" onClick={() => setIsTransferModalOpen(false)}>取消</Button>,
            <Button 
              key="submit" 
              type="primary" 
              danger 
              disabled={!selectedRecipient || transferConfirmLogin !== selectedRecipient.login}
              onClick={() => {
                message.success('所有权转移申请已提交，需超级管理员审批');
                setIsTransferModalOpen(false);
                setSelectedRecipient(null);
                setTransferConfirmLogin('');
              }}
            >
              确认转移
            </Button>
          ]}
        >
          <Space orientation="vertical" style={{ width: '100%' }} size={24}>
            <Alert
              title="转移所有权是一项敏感操作。成功后，您将失去该资源的所有控制权，身份将自动降级为“管理权”。"
              type="warning"
              showIcon
            />
            <Form layout="vertical">
              <Form.Item label="选择接收人" required>
                <Select
                  showSearch
                  placeholder="搜索内部用户..."
                  value={selectedRecipient?.login}
                  onSelect={(value) => {
                    const recipient = potentialRecipients.find(u => u.login === value);
                    setSelectedRecipient(recipient);
                  }}
                  filterOption={(input, option) => 
                    (option?.label as string || '').toLowerCase().includes(input.toLowerCase()) ||
                    (option?.value as string || '').toLowerCase().includes(input.toLowerCase()) ||
                    (option?.dept as string || '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={potentialRecipients.map(u => ({
                    value: u.login,
                    label: u.name,
                    dept: u.dept,
                    display: (
                      <Space>
                        <Avatar src={u.avatar} size="small" />
                        <div>
                          <div>{u.name} <Text type="secondary" style={{ fontSize: '12px' }}>@{u.login}</Text></div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{u.dept}</div>
                        </div>
                      </Space>
                    )
                  }))}
                  optionRender={(option) => (option.data as any).display}
                />
              </Form.Item>
              <Form.Item label="转移备注">
                <TextArea rows={2} placeholder="请说明转移原因..." />
              </Form.Item>
              <Form.Item 
                label="确认接收人账号" 
                required 
                extra={selectedRecipient ? `请输入 "${selectedRecipient.login}" 以确认` : '请先选择接收人'}
                validateStatus={selectedRecipient && transferConfirmLogin && transferConfirmLogin !== selectedRecipient.login ? 'error' : ''}
              >
                <Input 
                  placeholder="请输入接收人的登录账号以确认" 
                  value={transferConfirmLogin}
                  onChange={e => setTransferConfirmLogin(e.target.value)}
                  disabled={!selectedRecipient}
                />
              </Form.Item>
            </Form>
          </Space>
        </Modal>

        {/* Modal: Add Authorization Object */}
        <Modal
          title="选择授权对象"
          open={isAddObjectModalOpen}
          onCancel={() => setIsAddObjectModalOpen(false)}
          width={600}
          onOk={() => {
            selectedObjects.forEach(login => handleAddMember(login));
            message.success(`成功添加 ${selectedObjects.length} 个授权对象`);
            setIsAddObjectModalOpen(false);
            setSelectedObjects([]);
          }}
          okText="确认添加"
          cancelText="取消"
        >
          <Space orientation="vertical" style={{ width: '100%' }} size={16}>
            <Input 
              prefix={<SearchOutlined />} 
              placeholder="搜索姓名、部门、职位或登录名" 
              size="large"
              value={addObjectSearch}
              onChange={e => setAddObjectSearch(e.target.value)}
            />
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table 
                dataSource={potentialRecipients.filter(u => 
                  u.name.includes(addObjectSearch) || 
                  u.dept.includes(addObjectSearch) || 
                  u.login.includes(addObjectSearch)
                )}
                rowKey="login"
                size="small"
                pagination={false}
                rowSelection={{
                  selectedRowKeys: selectedObjects,
                  onChange: (keys) => setSelectedObjects(keys as string[]),
                }}
                columns={[
                  {
                    title: '人员信息',
                    dataIndex: 'name',
                    render: (text, record) => (
                      <Space>
                        <Avatar src={record.avatar} size="small" />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{text}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{record.dept}</div>
                        </div>
                      </Space>
                    )
                  },
                  {
                    title: '登录名',
                    dataIndex: 'login',
                    render: (text) => <Text type="secondary">{text}</Text>
                  }
                ]}
              />
            </div>
          </Space>
        </Modal>

        {/* Modal: Batch Modify Permission Level */}
        <Modal
          title="批量修改权限级别"
          open={isBatchPermissionModalOpen}
          onCancel={() => setIsBatchPermissionModalOpen(false)}
          onOk={() => {
            handleBatchLevelChange(batchPermissionLevel);
            setIsBatchPermissionModalOpen(false);
          }}
          okText="确认修改"
          cancelText="取消"
        >
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '8px' }}>请选择选中的 {selectedRowKeys.length} 个对象的权限级别：</div>
            <Select
              style={{ width: '100%' }}
              value={batchPermissionLevel}
              onChange={setBatchPermissionLevel}
              options={Object.values(PermissionLevel)
                .filter(l => l !== PermissionLevel.OWNER)
                .map(level => ({ value: level, label: level }))}
            />
          </div>
        </Modal>

        {/* Modal: Batch Set Expiry Date */}
        <Modal
          title="批量设置到期日期"
          open={isBatchExpiryModalOpen}
          onCancel={() => setIsBatchExpiryModalOpen(false)}
          onOk={() => {
            handleBatchExpiryChange(isPermanent ? '' : (batchExpiryDate || ''));
            setIsBatchExpiryModalOpen(false);
          }}
          okText="确认设置"
          cancelText="取消"
        >
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '16px' }}>请为选中的 {selectedRowKeys.length} 个对象设置到期日期：</div>
            <Flex vertical gap={8} style={{ width: '100%' }}>
              <DatePicker
                style={{ width: '100%' }}
                disabled={isPermanent}
                disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))}
                onChange={(_, dateString) => setBatchExpiryDate(dateString as string)}
                placeholder="选择到期日期"
              />
              <Checkbox 
                checked={isPermanent} 
                onChange={e => setIsPermanent(e.target.checked)}
              >
                永久有效
              </Checkbox>
            </Flex>
          </div>
        </Modal>

        {/* Modal: Rejection Reason */}
        <Modal
          title="驳回申请"
          open={!!rejectingRequestId}
          onCancel={() => setRejectingRequestId(null)}
          onOk={handleReject}
          okText="确认驳回"
          okButtonProps={{ danger: true, disabled: !rejectReason.trim() }}
          cancelText="取消"
        >
          <Space orientation="vertical" style={{ width: '100%' }} size={16}>
             <Text type="secondary">请说明驳回的具体原因，以便申请人改进并重新提交。</Text>
             <TextArea 
               rows={4} 
               placeholder="请输入驳回理由..." 
               value={rejectReason} 
               onChange={(e) => setRejectReason(e.target.value)} 
             />
          </Space>
        </Modal>

        {/* Modal: Record Detail */}
        <Modal
          title="申请详情"
          open={!!selectedRecord}
          onCancel={() => setSelectedRecord(null)}
          footer={<Button onClick={() => setSelectedRecord(null)}>关闭</Button>}
        >
          {selectedRecord && (
            <Space orientation="vertical" style={{ width: '100%' }} size={24}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Avatar src={selectedRecord.userAvatar} size={64} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>{selectedRecord.userName}</Title>
                  <Text type="secondary">提交于 {selectedRecord.submitTime}</Text>
                </div>
              </div>
              
              <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                <Text strong>申请原因</Text>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  {selectedRecord.reason}
                </div>
              </Space>

              {selectedRecord.status === '通过' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                    <div style={{ fontSize: '10px', color: '#52c41a', fontWeight: 'bold' }}>授权级别</div>
                    <div style={{ fontWeight: 'bold' }}>{selectedRecord.approvedLevel}</div>
                  </div>
                  <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                    <div style={{ fontSize: '10px', color: '#52c41a', fontWeight: 'bold' }}>过期日期</div>
                    <div style={{ fontWeight: 'bold' }}>{selectedRecord.approvedExpiry}</div>
                  </div>
                </div>
              )}

              {selectedRecord.status === '驳回' && (
                <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                  <Text strong type="danger">驳回原因</Text>
                  <div style={{ padding: '16px', background: '#fff1f0', borderRadius: '8px', border: '1px solid #ffa39e', color: '#cf1322' }}>
                    {selectedRecord.rejectReason}
                  </div>
                </Space>
              )}
            </Space>
          )}
        </Modal>
      </Drawer>
    </ConfigProvider>
  );
}
