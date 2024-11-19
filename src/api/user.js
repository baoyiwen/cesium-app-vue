import request from '../utils/request';

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get',
  });
}

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data,
  });
}

// 刷新 Token
export function refreshToken() {
  return request({
    url: '/user/refresh-token',
    method: 'post',
    data: {
      refreshToken: localStorage.getItem('refreshToken'),
    },
  });
}
