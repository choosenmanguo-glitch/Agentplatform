import React, { useState } from 'react';
import { Typography, Button, Tabs, Empty, Table, Space, Input, Select, Drawer, Form, message, Alert, Radio, Switch, Divider } from 'antd';
import { ArrowLeftOutlined, ApiOutlined, PlusOutlined, SearchOutlined, ReloadOutlined, SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// Mock Data
const mockDataSources = [
  {
    id: 1,
    name: '企业信息数据库_数仓',
    dataType: '结构化',
    dbType: 'TIDB',
    dbName: 'YUANSUDATA',
    creator: 'guoqj',
    createTime: '2026-04-21 11:39:10',
    updateTime: '2026-04-21 11:39:10',
    source: '天枢数据中台',
    sourceName: 'YUANSUDATA_ORIGIN',
    description: '这是从天枢导入的企业信息数据库数仓',
  },
  {
    id: 2,
    name: '企业信息数据库_原始库',
    dataType: '结构化',
    dbType: 'MYSQL',
    dbName: 'yuansu',
    creator: 'guoqj',
    createTime: '2026-04-09 19:36:50',
    updateTime: '2026-04-21 11:12:04',
    source: '自建',
    sourceName: '',
    description: '原始数据库',
  },
  {
    id: 3,
    name: '产业-企业-专利数据库',
    dataType: '结构化',
    dbType: 'MYSQL',
    dbName: 'test_wrs',
    creator: 'guoqj',
    createTime: '2026-04-15 13:59:19',
    updateTime: '2026-04-15 13:59:19',
    source: '自建',
    sourceName: '',
    description: '专利相关数据库',
  },
  {
    id: 4,
    name: '知识专利数据库',
    dataType: '结构化',
    dbType: 'MYSQL',
    dbName: 'test',
    creator: 'guoqj',
    createTime: '2026-04-09 19:33:38',
    updateTime: '2026-04-09 19:33:38',
    source: '自建',
    sourceName: '',
    description: '知识库相关数据',
  }
];

const mockTianshuSources = [
  { value: 'source1', label: '天枢_财税数据大宽表', description: '包含全省各类企业的财税关联数据，每日凌晨更新' },
  { value: 'source2', label: '天枢_工商基础信息表', description: '全量工商登记信息，覆盖各类市场主体结构' },
  { value: 'source3', label: '天枢_知识产权明细库', description: '专利、商标、软著等知识产权的详细申报记录与审批情况' },
];

export default function TianshuConnectionPage() {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState([...mockDataSources]);
  
  // Drawer states
  const [importDrawerOpen, setImportDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  const [importForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [testingConnection, setTestingConnection] = useState(false);

  const columns = [
    { title: '数据源名称', dataIndex: 'name', key: 'name', render: (text: string) => <a style={{color: '#1677ff'}}>{text}</a> },
    { title: '数据类型', dataIndex: 'dataType', key: 'dataType' },
    { title: '数据库类型', dataIndex: 'dbType', key: 'dbType' },
    { title: '数据库名称', dataIndex: 'dbName', key: 'dbName' },
    { title: '创建人', dataIndex: 'creator', key: 'creator' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', sorter: (a: any, b: any) => a.createTime.localeCompare(b.createTime) },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', sorter: (a: any, b: any) => a.updateTime.localeCompare(b.updateTime) },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <a onClick={() => openEditDrawer(record)}>编辑</a>
          <a>删除</a>
        </Space>
      ),
    },
  ];

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      message.success('连接测试成功！');
    }, 1000);
  };

  const handleImportSubmit = () => {
    importForm.validateFields().then(values => {
      const selectedSource = mockTianshuSources.find(s => s.value === values.tianshuSource);
      const newSource = {
        id: Date.now(),
        name: values.name,
        dataType: '结构化',
        dbType: 'TIDB',
        dbName: selectedSource?.label || 'UNKNOWN',
        creator: '演示用户',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        source: '天枢数据中台',
        sourceName: selectedSource?.label || '',
        description: values.description,
      };
      setDataSources([newSource, ...dataSources]);
      message.success('导入成功');
      setImportDrawerOpen(false);
      importForm.resetFields();
    });
  };

  const openEditDrawer = (record: any) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      name: record.name,
      source: record.source,
      sourceName: record.sourceName,
      description: record.description
    });
    setEditDrawerOpen(true);
  };

  const handleEditSubmit = () => {
    editForm.validateFields().then(values => {
      const updatedData = dataSources.map(item => {
        if (item.id === editingRecord.id) {
          return {
            ...item,
            name: values.name,
            description: values.description,
            updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
        return item;
      });
      setDataSources(updatedData);
      message.success('数据源信息已更新');
      setEditDrawerOpen(false);
    });
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')} 
            style={{ padding: 0, marginRight: '16px', color: '#1e293b', fontSize: '18px' }}
          />
          <Title level={4} style={{ margin: 0 }}>连接天枢</Title>
        </div>

        <Tabs 
          defaultActiveKey="2" 
          items={[
            {
              key: '1',
              label: '天枢文件集',
              children: (
                <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
                  <Form layout="horizontal" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                    <Form.Item label={<span style={{color: '#ff4d4f'}}>* 选择数据</span>} colon={false}>
                      <Radio.Group defaultValue="tianshu">
                        <Radio value="file">文件库</Radio>
                        <Radio value="db">数据源</Radio>
                        <Radio value="tianshu">天枢文件集</Radio>
                      </Radio.Group>
                    </Form.Item>
    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingLeft: 'calc(12.5% + 8px)' }}>
                      <div style={{ flex: 1, border: '1px solid #d9d9d9', borderRadius: '6px', padding: '12px', minHeight: '300px' }}>
                        <Select placeholder="请选择文件集" style={{ width: '100%', marginBottom: '16px' }} />
                        <div style={{ height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf', background: '#fafafa', borderRadius: '4px' }}>
                          加载文件集下的文件目录（多级树状）
                        </div>
                      </div>
                      <div style={{ flex: 1, border: '1px solid #d9d9d9', borderRadius: '6px', padding: '12px', minHeight: '300px' }}>
                        <div style={{ marginBottom: '16px', fontWeight: 500 }}>已选文档 0/100个</div>
                        <div style={{ height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf', background: '#fafafa', borderRadius: '4px', textAlign: 'center', padding: '0 20px' }}>
                          加载目录节点下的文件列表，可选择，参考文件库/数据源tab
                        </div>
                      </div>
                    </div>
    
                    <Form.Item label={<span style={{color: '#ff4d4f'}}>* 导入位置</span>} colon={false}>
                      <Select defaultValue="all" style={{ width: '100%' }} options={[{ value: 'all', label: '全部' }]} />
                    </Form.Item>
    
                    <Form.Item label={<span style={{color: '#ff4d4f'}}>* 文本解析</span>} colon={false}>
                      <Radio.Group defaultValue="ocr">
                        <Radio value="text">文字提取 <QuestionCircleOutlined style={{ color: '#bfbfbf' }} /></Radio>
                        <Radio value="ocr">文字OCR识别 <QuestionCircleOutlined style={{ color: '#bfbfbf' }} /></Radio>
                      </Radio.Group>
                    </Form.Item>
    
                    <Form.Item label={<span style={{color: '#ff4d4f'}}>* 文档切分</span>} colon={false}>
                      <div style={{ 
                        border: '1px solid #1677ff', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        width: '300px',
                        background: '#e6f4ff',
                        cursor: 'pointer',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ fontSize: '24px', color: '#1677ff' }}>📄</div>
                          <div>
                            <div style={{ fontWeight: 500, marginBottom: '4px', color: '#1e293b' }}>文档智能切分</div>
                            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                              基于文档结构对文档进行切分，在多数文档上可获得最佳效果。
                            </div>
                          </div>
                        </div>
                        <Radio checked={true} style={{ position: 'absolute', top: '16px', right: '16px' }} />
                      </div>
                    </Form.Item>
                  </Form>
                </div>
              )
            },
            {
              key: '2',
              label: '天枢数仓数据源',
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <Space>
                      <Button type="primary" icon={<PlusOutlined />}>新增</Button>
                      <Button 
                        icon={<ApiOutlined />} 
                        onClick={() => setImportDrawerOpen(true)}
                        style={{ borderColor: '#1677ff', color: '#1677ff' }}
                      >
                        从天枢导入
                      </Button>
                    </Space>
                    <Space>
                      <Select placeholder="请选择数据类型" style={{ width: 140 }} allowClear options={[
                        { value: 'struct', label: '结构化' },
                        { value: 'unstruct', label: '非结构化' }
                      ]} />
                      <Select placeholder="请选择数据库类型" style={{ width: 140 }} allowClear options={[
                        { value: 'mysql', label: 'MYSQL' },
                        { value: 'tidb', label: 'TIDB' }
                      ]} />
                      <Input placeholder="请输入数据源名称" suffix={<SearchOutlined />} style={{ width: 200 }} />
                      <Button icon={<SearchOutlined />} type="primary" ghost shape="circle" />
                      <Button icon={<ReloadOutlined />} shape="circle" />
                      <Button icon={<SettingOutlined />} shape="circle" />
                    </Space>
                  </div>
      
                  <Table 
                    rowSelection={{ type: 'checkbox' }}
                    columns={columns} 
                    dataSource={dataSources} 
                    rowKey="id"
                    pagination={{ 
                      total: dataSources.length, 
                      showTotal: total => `共 ${total} 条`, 
                      showSizeChanger: true, 
                      showQuickJumper: true,
                      defaultPageSize: 10,
                      defaultCurrent: 1
                    }}
                  />
                </>
              )
            },
            {
              key: '3',
              label: '配置天枢连接',
              children: (
                <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', minHeight: '500px' }}>
                  <Form layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 12 }}>
                    <Title level={5} style={{ marginBottom: '24px' }}>基础配置</Title>
                    <Form.Item label="服务域名" extra="配置天枢平台的服务访问域名，例如：https://api.tianshu.com">
                      <Input placeholder="请输入天枢服务域名" />
                    </Form.Item>
                    <Form.Item label="租户关系关联" extra="输入当前平台租户在天枢对应的租户唯一标识">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Input placeholder="请输入租户唯一标识" />
                        <Button type="primary" onClick={() => message.success('验证通过，关联成功！')}>提交验证并关联</Button>
                      </div>
                    </Form.Item>
    
                    <Divider style={{ margin: '40px 0' }} />
                    
                    <Title level={5} style={{ marginBottom: '24px' }}>功能控制</Title>
                    <Form.Item label="文件集关联控制" valuePropName="checked" extra="打开时，知识库导入文件可以选择天枢的文件集作为文件来源">
                      <Switch defaultChecked />
                    </Form.Item>
                    <Form.Item label="数据源关联控制" valuePropName="checked" extra="打开时，数据源模块可以将天枢的数仓数据源导入平台数据源">
                      <Switch defaultChecked />
                    </Form.Item>
                    
                    <Form.Item wrapperCol={{ offset: 4 }} style={{ marginTop: '32px' }}>
                      <Button type="primary" onClick={() => message.success('配置已保存')}>保存配置</Button>
                    </Form.Item>
                  </Form>
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Import from Tianshu Drawer */}
      <Drawer
        title="从天枢导入数仓数据源"
        size="large"
        onClose={() => setImportDrawerOpen(false)}
        open={importDrawerOpen}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setImportDrawerOpen(false)}>关闭</Button>
              <Button type="primary" loading={testingConnection} onClick={handleTestConnection}>连接测试</Button>
              <Button onClick={handleImportSubmit}>保存</Button>
            </Space>
          </div>
        }
      >
        <Form 
          form={importForm} 
          layout="horizontal" 
          labelCol={{ span: 5 }} 
          wrapperCol={{ span: 19 }}
        >
          <Form.Item 
            name="tianshuSource" 
            label="数仓数据源" 
            rules={[{ required: true, message: '请选择天枢数仓数据源' }]}
          >
            <Select 
              placeholder="请选择" 
              onChange={(value, option: any) => {
                if (option) {
                  importForm.setFieldsValue({
                    name: option.label,
                    description: option.description
                  });
                }
              }}
              options={mockTianshuSources}
              optionRender={(option) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text strong>{option.data.label}</Text>
                  <Text type="secondary" ellipsis style={{ fontSize: '12px', maxWidth: '100%' }} title={option.data.description}>
                    {option.data.description}
                  </Text>
                </div>
              )}
            />
          </Form.Item>
          
          <Form.Item 
            name="name" 
            label="数据源名称" 
            rules={[{ required: true, message: '请输入数据源名称' }]}
          >
            <Input placeholder="请输入，将用于系统内部显示" />
          </Form.Item>

          <Form.Item 
            name="description" 
            label="数据源描述"
          >
            <Input.TextArea placeholder="请输入描述信息" rows={4} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Edit Data Source Drawer */}
      <Drawer
        title="查看/编辑数据源"
        size="large"
        onClose={() => setEditDrawerOpen(false)}
        open={editDrawerOpen}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditDrawerOpen(false)}>关闭</Button>
              <Button type="primary" onClick={handleEditSubmit}>保存</Button>
            </Space>
          </div>
        }
      >
        {editingRecord && (
          <Form 
            form={editForm} 
            layout="horizontal"
            labelCol={{ span: 5 }} 
            wrapperCol={{ span: 19 }}
          >
            <Form.Item 
              name="name" 
              label="数据源名称" 
              rules={[{ required: true, message: '请输入数据源名称' }]}
            >
              <Input placeholder="请输入数据源名称" />
            </Form.Item>

            <Form.Item 
              name="source" 
              label="来源" 
            >
              <Input disabled />
            </Form.Item>

            {editingRecord.source === '天枢数据中台' && (
              <Form.Item 
                name="sourceName" 
                label="源端名称" 
              >
                <Input disabled />
              </Form.Item>
            )}

            <Form.Item 
              name="description" 
              label="数据源描述"
            >
              <Input.TextArea placeholder="请输入描述信息" rows={4} />
            </Form.Item>
            
            {editingRecord.source === '天枢数据中台' && (
              <Alert 
                showIcon 
                type="info" 
                message="来源于天枢数据中台的数据源，其底层连接信息不可修改，只能更新名称和描述。" 
                style={{ marginTop: '16px' }}
              />
            )}
          </Form>
        )}
      </Drawer>
    </div>
  );
}

