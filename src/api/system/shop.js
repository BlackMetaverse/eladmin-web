import request from '@/utils/request'

export function getAllShop() {
  const params = {
    page: 0,
    size: 9999,
    enabled: true
  }
  return request({
    url: 'api/shop',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/shop',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/shop',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/shop',
    method: 'put',
    data
  })
}

export default { add, edit, del }
