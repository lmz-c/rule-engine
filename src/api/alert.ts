import request from '@/utils/request'

// ===== 告警管理 =====
export const getAlertList = (params?: any) => {
  return request.get('/api/alert/list', { params })
}

export const getAlertByDevice = (deviceId: string) => {
  return request.get(`/api/alert/device/${deviceId}`)
}

export const clearAlert = (alertId: string) => {
  return request.put(`/api/alert/clear/${alertId}`)
}

export const getAlertStatistics = () => {
  return request.get('/api/alert/statistics')
}