import request from '@/utils/request'

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
export const simulateDeviceReport = (deviceId: string, payload: any) => {
  return request.post('/api/simulate/device', { deviceId, payload })
}