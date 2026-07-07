import request from '@/utils/request'

// ===== 节点元数据 =====
export const getNodeTypes = () => {
  return request.get('/api/meta/nodeTypes')
}

// ===== 规则链 CRUD =====
export const getRuleChainList = (params?: any) => {
  return request.get('/api/chain/list', { params })
}

export const getRuleChain = (chainId: string) => {
  return request.get(`/api/chain/${chainId}`)
}

export const saveRuleChain = (data: any) => {
  return request.post('/api/chain/save', data)
}

export const deleteRuleChain = (chainId: string) => {
  return request.delete(`/api/chain/${chainId}`)
}

export const updateChainStatus = (chainId: string, status: number) => {
  return request.put('/api/chain/status', null, { params: { chainId, status } })
}

// ===== 设备绑定 =====
export const bindDevice = (deviceId: string, chainId: string) => {
  return request.post('/api/bind/device', { deviceId, chainId })
}

export const unbindDevice = (deviceId: string) => {
  return request.delete(`/api/bind/device/${deviceId}`)
}

export const getDeviceBind = (deviceId: string) => {
  return request.get(`/api/bind/device/${deviceId}`)
}