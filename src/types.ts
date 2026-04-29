export enum PermissionLevel {
  VISIBLE = '仅可见',
  USE = '使用权',
  MANAGE = '管理权',
  OWNER = '所有权',
}

export enum VisibilityMode {
  FULLY_PUBLIC = '完全公开',
  PUBLIC_VISIBLE = '公开可见，授权可用',
  FULLY_AUTHORIZED = '完全授权',
}

export type ResourceType = '模型' | '工具' | '自定义API' | 'MCP' | '工作流' | '数据源' | '文件库' | '知识图谱' | '智能体' | '知识库';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  owner: string;
  visibilityMode: VisibilityMode;
  userPermission: PermissionLevel;
  createdAt: string;
  // Personalized info
  modelType?: '大模型' | 'rerank' | '向量化模型';
  deploymentMode?: '公网' | '本地';
  knowledgeBaseType?: '文档知识库' | '结构化知识库' | '图结构知识库';
  databaseType?: 'MySQL' | 'TiDB' | 'MinIO';
}

export interface PermissionMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department?: string; // Add department
  level: PermissionLevel;
  expiryDate?: string;
}

export interface ApprovalRequest {
  id: string;
  userName: string;
  userAvatar: string;
  resourceName: string;
  reason: string;
  status: '待处理' | '通过' | '驳回';
  submitTime: string;
  rejectReason?: string;
  approvedLevel?: PermissionLevel;
  approvedExpiry?: string;
}

export interface AuditLog {
  id: string;
  operator: string;
  action: string;
  target: string;
  detail: string;
  time: string;
}
