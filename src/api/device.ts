import request from '@/utils/request'


// 绑定设备到规则链
export const bindDevice = (data: { deviceId: string; chainId: string }): Promise<{ code: number; msg: string; data?: any }> => {
  return request.post('/api/bind/device', data)
}

// ===== 设备管理 =====
export const getDeviceList = (params?: any) => {
  return request.get('/api/device/list', { params })
}

export const getDeviceDetail = (deviceId: string) => {
  return request.get(`/api/device/${deviceId}`)
}

export const registerDevice = (data: any) => {
  return request.post('/api/device/register', data)
}

export const deleteDevice = (deviceId: string) => {
  return request.delete(`/api/device/${deviceId}`)
}

export const updateDeviceLocation = (deviceId: string, latitude: number, longitude: number) => {
  return request.put('/api/device/location', null, {
    params: { deviceId, latitude, longitude }
  })
}
// ===== 设备管理 =====
// 根据 deviceId 或 status 获取设备列表
export const getDevice = (params?: { deviceId?: string; status?: number }) => {
  return request.get('/api/device/listByCondition', { params })
}

// ===== 产品管理 =====
export const getProductList = () => {
  return request.get('/api/product/list')
}

export const saveProduct = (data: any) => {
  return request.post('/api/product/save', data)
}

export const deleteProduct = (id: number) => {
  return request.delete(`/api/product/${id}`)
}

// ===== 模拟设备上报 =====
export const simulateDeviceReport = (deviceId: string, payload: any): Promise<{ code: number; msg: string; data?: any }> => {
  return request.post('/api/simulate/device', { deviceId, payload })
}