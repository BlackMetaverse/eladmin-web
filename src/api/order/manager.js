import request from '@/utils/request'

export function queryTopOrderPrice(startTime) {
  return request({
    url: 'auth/order/queryTopOrderPrice?startTime=' + startTime,
    method: 'get'
  })
}

export function queryNewOrder(startTime) {
  return request({
    url: 'auth/order/queryNewOrder?startTime=' + startTime,
    method: 'get'
  })
}

export function queryMonthTotalProfit(startTime) {
  return request({
    url: 'auth/order/queryMonthTotalProfit?startTime=' + startTime,
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: 'api/order',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/order/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/order',
    method: 'put',
    data
  })
}

export default { add, edit, del }
