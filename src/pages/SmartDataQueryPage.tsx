import React, { useState, useEffect } from 'react';
import { 
  Typography, Breadcrumb, Card, Space, Select, Tag, 
  Input, Button, Tabs, Table, Drawer, Progress, 
  List, Badge, message, Tooltip, Empty, Descriptions,
  App as AntdApp, Flex, Divider
} from 'antd';
import { 
  LayoutOutlined, 
  DatabaseOutlined, 
  ThunderboltOutlined, 
  InteractionOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AntdCard = Card as any;

// --- Types ---

interface Field {
  key: string;
  name: string;
  comment: string;
  type: string;
}

interface DataRow {
  id: string;
  tableName: string;
  description: string;
  fields: Field[];
  status?: 'waiting' | 'processing' | 'done' | 'error';
  optimizationResult?: string;
}

// --- Mock Data ---

const MOCK_TABLES: DataRow[] = [
  {
    id: '1',
    tableName: 'ODS_COMPANY',
    description: '【表名】：工商总局-企业主表\n【实体粒度】：每一行代表一家唯一的企业/公司实体。\n【业务背景】：这是工商局的企业核心主数据表，存储了全国（或特定区域）企业的最基础注册信息和各种官方核心标识码。',
    fields: [
      { key: '1', name: 'ID', comment: '主键ID', type: 'int' },
      { key: '2', name: 'ENTID', comment: '企业唯一标识', type: 'varchar' },
      { key: '3', name: 'ENTNAME', comment: '企业全称', type: 'varchar' },
      { key: '4', name: 'DOM', comment: '住所/注册地址', type: 'varchar' },
      { key: '5', name: 'REGCAP', comment: '注册资本', type: 'decimal' },
    ]
  },
  {
    id: '2',
    tableName: 'ODS_COMPANY_BASIC',
    description: '企业基础信息表，包含注册号、成立日期等基础信息。',
    fields: [
      { key: '1', name: 'REGNO', comment: '注册号', type: 'varchar' },
      { key: '2', name: 'ESTDATE', comment: '成立日期', type: 'date' },
    ]
  },
  {
    id: '3',
    tableName: 'ODS_IPR_PATENT',
    description: '知识产权-专利信息表。',
    fields: [
      { key: '1', name: 'PATENT_NO', comment: '专利号', type: 'varchar' },
      { key: '2', name: 'TITLE', comment: '专利名称', type: 'varchar' },
    ]
  }
];

// --- Components ---

const SmartDataQueryPage: React.FC = () => {
  return (
    <AntdApp>
      <SmartDataQueryContent />
    </AntdApp>
  );
};

const SmartDataQueryContent: React.FC = () => {
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const [selectedTableId, setSelectedTableId] = useState<string>(MOCK_TABLES[0].id);
  const [tables, setTables] = useState<DataRow[]>(MOCK_TABLES);
  const [singleDrawerOpen, setSingleDrawerOpen] = useState(false);
  const [batchDrawerOpen, setBatchDrawerOpen] = useState(false);

  const currentTable = tables.find(t => t.id === selectedTableId) || tables[0];

  // --- Handlers ---

  const handleUpdateDescription = (id: string, newDesc: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, description: newDesc } : t));
    message.success('表描述已更新');
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Flex vertical gap={0}>
          <Breadcrumb 
            items={[
              { 
                title: (
                  <Space 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => navigate('/')}
                  >
                    <ArrowLeftOutlined /> 智能体配置
                  </Space>
                ) 
              }
            ]} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#e6f7ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RobotOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>智能问数配置 <Tag color="blue" style={{ marginLeft: '8px' }}>标准智能体-智能问数</Tag></Title>
              <Text type="secondary" size="small">配置企业级知识库与数据库的智能交互逻辑</Text>
            </div>
          </div>
        </Flex>
        
        <Space>
          <Button>历史版本</Button>
          <Button type="primary">保存并测试</Button>
        </Space>
      </div>

      <AntdCard style={{ borderRadius: '12px' }} styles={{ body: { padding: '24px' } }}>
        <div style={{ marginBottom: '24px' }}>
          <Space size={16} align="center">
            <span style={{ color: '#ff4d4f' }}>*</span>
            <Text strong>选择数据源：</Text>
            <Select 
              defaultValue="ds-1" 
              style={{ width: 300 }}
              options={[{ label: '企业信息数据库_数仓', value: 'ds-1' }]}
            />
          </Space>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Table Sidebar */}
          <div style={{ background: '#fafafa', borderRight: '1px solid #f0f0f0', maxHeight: '700px', overflowY: 'auto' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
              <Flex vertical gap={4} style={{ width: '100%' }}>
                <Text strong type="secondary" style={{ fontSize: '12px' }}>* 选择表</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {tables.map(t => (
                    <Tag 
                      key={t.id} 
                      closable 
                      onClose={() => {}} 
                      style={{ cursor: 'pointer', margin: 0 }}
                      color={selectedTableId === t.id ? 'blue' : 'default'}
                    >
                      {t.tableName}
                    </Tag>
                  ))}
                </div>
              </Flex>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tables.map((item: DataRow) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedTableId(item.id)}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '12px 16px',
                    background: selectedTableId === item.id ? '#e6f7ff' : 'transparent',
                    borderLeft: selectedTableId === item.id ? '3px solid #1890ff' : '3px solid transparent',
                    transition: 'all 0.3s'
                  }}
                >
                  <Text ellipsis={{ tooltip: item.tableName }} style={{ color: selectedTableId === item.id ? '#1890ff' : 'inherit' }}>
                    {item.tableName}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Detail */}
          <div style={{ padding: '24px', background: 'white' }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                <Text strong style={{ width: '100px', flexShrink: 0, marginTop: '8px' }}>数据表描述：</Text>
                <div style={{ flexGrow: 1 }}>
                  <TextArea 
                    value={currentTable.description} 
                    autoSize={{ minRows: 4, maxRows: 8 }}
                    onChange={(e) => handleUpdateDescription(currentTable.id, e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                  <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                    <Button 
                      type="link" 
                      icon={<ThunderboltOutlined />} 
                      style={{ padding: 0 }}
                      onClick={() => setSingleDrawerOpen(true)}
                    >
                      AI优化表描述
                    </Button>
                    <Button 
                      type="link" 
                      icon={<InteractionOutlined />} 
                      style={{ padding: 0 }}
                      onClick={() => setBatchDrawerOpen(true)}
                    >
                      批量优化表描述
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: <Space><span style={{ color: '#ff4d4f' }}>*</span> 字段配置</Space>,
                  children: (
                    <div style={{ marginTop: '16px' }}>
                      <Tabs
                        size="small"
                        type="card"
                        items={[
                          { key: 'inc', label: '已选字段' },
                          { key: 'exc', label: '已移除字段' }
                        ]}
                      />
                      <Table 
                        dataSource={currentTable.fields}
                        pagination={false}
                        size="small"
                        columns={[
                          { title: '字段名', dataIndex: 'name', key: 'name' },
                          { 
                            title: '注释', 
                            dataIndex: 'comment', 
                            key: 'comment',
                            render: (text) => <Text editable={{ tooltip: '点击编辑' }}>{text}</Text>
                          },
                          { title: '类型', dataIndex: 'type', key: 'type' },
                          { 
                            title: '操作', 
                            key: 'action',
                            render: () => <Button type="link" danger>移除</Button> 
                          }
                        ]}
                      />
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>
      </AntdCard>

      {/* --- Single AI Optimize Drawer --- */}
      <AIOptimizeDrawer 
        open={singleDrawerOpen} 
        onClose={() => setSingleDrawerOpen(false)}
        table={currentTable}
        onConfirm={(newDesc) => {
          handleUpdateDescription(currentTable.id, newDesc);
          setSingleDrawerOpen(false);
        }}
      />

      {/* --- Batch AI Optimize Drawer --- */}
      <BatchAIOptimizeDrawer
        open={batchDrawerOpen}
        onClose={() => setBatchDrawerOpen(false)}
        tables={tables}
        onConfirm={(updatedTables) => {
          setTables(updatedTables);
          setBatchDrawerOpen(false);
          message.success('所有表描述已完成批量部署');
        }}
      />
    </div>
  );
};

// --- Sub-component: Single AI Optimize Drawer ---

const AIOptimizeDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  table: DataRow;
  onConfirm: (val: string) => void;
}> = ({ open, onClose, table, onConfirm }) => {
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');
  const [optimizedText, setOptimizedText] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) {
      setPhase('loading');
      setProgress(0);
      const timer = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(timer);
            setPhase('done');
            setOptimizedText(`【表名】：${table.tableName} (企业核心主数据)
【实体定义】：存储企业官方注册信息的原子层表，以 ENTID 为唯一主键。
【主要职能】：
1. 身份核验：通过 ENTNAME 和 注册号(REGNO) 进行精准匹配。
2. 规模评估：基于注册资本和从业人数(PRE_SIZE) 划分企业规模等级。
3. 区域分析：解析 DOM 字段进行省级和市级的数据透视。
【使用建议】：建议在问及"这是什么公司"或"这家公司在哪里"等基础信息查询场景下作为首选引用源。`);
            return 100;
          }
          return p + 5;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [open, table]);

  return (
    <Drawer
      title={<Space><ThunderboltOutlined style={{ color: '#faad14' }} /> AI 优化表描述</Space>}
      size="large"
      onClose={onClose}
      open={open}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button 
            type="primary" 
            disabled={phase === 'loading'} 
            onClick={() => onConfirm(optimizedText)}
          >
            确认更新
          </Button>
        </Space>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
        <AntdCard size="small" title="基础信息参考" style={{ background: '#f5f5f5', border: 'none' }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="表名称">{table.tableName}</Descriptions.Item>
            <Descriptions.Item label="包含字段">{table.fields.map(f => f.name).join(', ')}</Descriptions.Item>
          </Descriptions>
        </AntdCard>

        <div>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>原始描述：</Text>
          <div style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', color: '#888', fontSize: '13px' }}>
            {table.description}
          </div>
        </div>

        {phase === 'loading' ? (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px dashed #d9d9d9', borderRadius: '8px', padding: '40px' }}>
            <LoadingOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: '16px' }} />
            <Text type="secondary">AI 正在深度解析表结构与业务上下文...</Text>
            <div style={{ width: '80%', marginTop: '24px' }}>
              <Progress percent={progress} status="active" strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Text strong>AI 优化建议：</Text>
                <Tag color="success" icon={<CheckCircleOutlined />}>解析完成</Tag>
              </div>
              <TextArea 
                value={optimizedText} 
                onChange={(e) => setOptimizedText(e.target.value)}
                autoSize={{ minRows: 8, maxRows: 15 }}
                style={{ fontSize: '14px', lineHeight: '1.6', borderRadius: '8px' }}
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                💡 小贴士：更准确的描述能提升大模型问数的点击率与数据匹配度，您可以在此基础上微调。
              </Text>
            </div>
          </motion.div>
        )}
      </div>
    </Drawer>
  );
};

// --- Sub-component: Batch AI Optimize Drawer ---

const BatchAIOptimizeDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  tables: DataRow[];
  onConfirm: (tables: DataRow[]) => void;
}> = ({ open, onClose, tables, onConfirm }) => {
  const [localTables, setLocalTables] = useState<DataRow[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLocalTables(tables.map(t => ({ ...t, status: 'waiting' })));
      setStatus('idle');
      setProcessingId(null);
      // Highlight the first table by default, but don't show result yet
      if (tables.length > 0) {
        setActiveTableId(tables[0].id);
      }
    }
  }, [open, tables]);

  const startBatchProcess = async () => {
    setStatus('running');
    
    for (let i = 0; i < localTables.length; i++) {
      const targetId = localTables[i].id;
      setProcessingId(targetId);
      
      // Update to processing
      setLocalTables(prev => prev.map(t => t.id === targetId ? { ...t, status: 'processing' } : t));
      
      // Artificial delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update to done
      const result = `AI 已自动总结【${localTables[i].tableName}】的核心业务价值。包含 ${localTables[i].fields.length} 个重点字段说明。该表作为基础数据中心，具备高度的跨表关联价值。`;
      setLocalTables(prev => prev.map(t => t.id === targetId ? { ...t, status: 'done', optimizationResult: result } : t));
    }
    
    setProcessingId(null);
    setStatus('completed');
  };

  const selectedTable = localTables.find(t => t.id === activeTableId);
  const isRefreshingDetail = status === 'running' && processingId === activeTableId;

  return (
    <Drawer
      title={<Space><InteractionOutlined /> 批量优化表描述</Space>}
      styles={{ wrapper: { width: '900px' } }}
      onClose={onClose}
      open={open}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button 
            type="primary" 
            disabled={status !== 'completed'} 
            onClick={() => {
              const updated = localTables.map(t => ({
                ...t,
                description: t.optimizationResult || t.description
              }));
              onConfirm(updated);
            }}
          >
            应用全部更改
          </Button>
        </Space>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 450px', gap: '20px', height: '100%' }}>
        {/* Left: Progression List */}
        <div style={{ borderRight: '1px solid #f0f0f0', paddingRight: '20px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>待处理表 ({localTables.length})</Text>
            {status === 'idle' && (
              <Button type="primary" size="small" icon={<ThunderboltOutlined />} onClick={startBatchProcess}>开始批量优化</Button>
            )}
            {status === 'running' && (
              <Badge status="processing" text="正在批量执行中..." />
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {localTables.map((item: DataRow) => (
              <div
                key={item.id}
                style={{ 
                  padding: '12px', 
                  borderRadius: '6px', 
                  marginBottom: '8px',
                  background: activeTableId === item.id ? '#f0f7ff' : 'transparent',
                  border: activeTableId === item.id ? '1px solid #91d5ff' : '1px solid #f0f0f0',
                  cursor: (item.status === 'done' || item.status === 'processing' || status === 'idle') ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (item.status === 'done' || item.status === 'processing' || status === 'idle') {
                    setActiveTableId(item.id);
                  }
                }}
              >
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    {item.status === 'done' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    {item.status === 'processing' && <LoadingOutlined style={{ color: '#1890ff' }} />}
                    {item.status === 'waiting' && <Text type="secondary" style={{ width: '14px', textAlign: 'center' }}>-</Text>}
                    <Text strong={activeTableId === item.id}>{item.tableName}</Text>
                  </Space>
                  
                  {item.status === 'done' && <Button type="link" size="small" icon={<EditOutlined />}>查看并修改</Button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Results Preview & Edit */}
        <div style={{ padding: '0 0 0 10px', height: '100%' }}>
          <AnimatePresence mode="wait">
            {!selectedTable ? (
              <motion.div 
                key="empty-no-selection"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <Empty description={status === 'completed' ? "请从左侧选择表以查看结果" : "请从左侧选择表"} />
              </motion.div>
            ) : (
              <motion.div 
                key={selectedTable.id}
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}
              >
                <div>
                  <Title level={5} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: 0 }}>
                    {selectedTable.tableName}
                    <Text type="secondary" style={{ fontSize: '12px', fontWeight: 'normal' }}>
                      {selectedTable.status === 'done' ? '优化完成' : (selectedTable.status === 'processing' ? '正在优化...' : '等待优化')}
                    </Text>
                  </Title>
                  <Divider style={{ margin: '12px 0' }} />
                </div>

                <AntdCard size="small" title="基础信息参考" style={{ background: '#f5f5f5', border: 'none' }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="表名称">{selectedTable.tableName}</Descriptions.Item>
                    <Descriptions.Item label="包含字段">{selectedTable.fields.map(f => f.name).join(', ')}</Descriptions.Item>
                  </Descriptions>
                </AntdCard>

                <div>
                  <Text strong style={{ fontSize: '13px' }}>原始描述参考：</Text>
                  <Paragraph type="secondary" style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>
                    {selectedTable.description}
                  </Paragraph>
                </div>

                <div style={{ flexGrow: 1, borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                  <AnimatePresence mode="wait">
                    {status === 'idle' ? (
                      <motion.div 
                        key="idle-state"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Empty 
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <Flex vertical gap={12} align="center">
                              <Text type="secondary">请执行批量优化以生成 AI 建议</Text>
                              <Button type="primary" ghost icon={<ThunderboltOutlined />} onClick={startBatchProcess}>立即开始</Button>
                            </Flex>
                          } 
                        />
                      </motion.div>
                    ) : (isRefreshingDetail || selectedTable.status === 'processing') ? (
                      <motion.div 
                        key="loading-detail"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px dashed #d9d9d9', borderRadius: '8px' }}
                      >
                        <LoadingOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: '12px' }} />
                        <Text type="secondary">AI 正在为当前表生成优化描述...</Text>
                      </motion.div>
                    ) : selectedTable.status === 'done' ? (
                      <motion.div 
                        key="result-state"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>AI 优化结果：</Text>
                        <TextArea 
                          value={selectedTable.optimizationResult || selectedTable.description}
                          autoSize={{ minRows: 4, maxRows: 10 }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocalTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, optimizationResult: val } : t));
                          }}
                        />
                        <div style={{ background: '#fffbe6', padding: '12px', border: '1px solid #ffe58f', borderRadius: '6px', marginTop: '20px' }}>
                          <Space align="start">
                            <Tooltip title="AI 提示">
                              <RobotOutlined style={{ color: '#faad14', marginTop: '3px' }} />
                            </Tooltip>
                            <Text size="small" type="secondary">AI 根据您的业务需求自动生成了建议描述，您可以直接修改并应用。</Text>
                          </Space>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="waiting-queue"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Empty description="队列等待中..." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Drawer>
  );
};

export default SmartDataQueryPage;
