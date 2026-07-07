import request from '@/utils/request'

// ===== 审计日志查询 =====
export const getAuditLogs = (params?: {
  chainId?: string
  deviceId?: string
  startTime?: string
  endTime?: string
  page?: number
  size?: number
}) => {
  return request.get('/api/audit/search', { params })
}

export const getAuditTrace = (traceId: string) => {
  return request.get(`/api/audit/trace/${traceId}`)
}