import axios from 'axios';
import { LOGIN, REFRESH, REGISTER } from './url';
import { store } from '../store';
import {
  getGrantType,
  getAccessToken,
  getAuth,
  setAuthInfo,
  cleanAuthInfo,
} from 'store/modules/auth';
export const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

const excludeRetry = [LOGIN, REFRESH, REGISTER];
// OPTIMIZE wrapper request push to queue when refresh
// Interceptor  send request
api.interceptors.request.use(
  (config) => {
    // NOTE await have authentication backend
    const token = getAccessToken();
    const grantType = getGrantType();
    if (!excludeRetry.includes(config.url)) {
      config._retry ??= 2;
    }
    if (token && ![LOGIN, REGISTER].includes(config.url)) {
      //update login and register dont send token because token dont remove when expired date will error
      config.headers['Authorization'] = `${grantType} ${token}`; // token // TODO Add Bear after have authentication api  "Bearer"
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
const booleanRefresh = (value) => {
  if (
    value === 'false' ||
    value === 0 ||
    value === 'null' ||
    value === 'undefined' ||
    value <= 0
  ) {
    return false;
  } else {
    return !!value;
  }
};

const generateNewRetry = (value) => {
  if (value === true || value === 'true') {
    return true;
  } else if (!isNaN(parseInt(value))) {
    return parseInt(value) - 1;
  } else {
    return false;
  }
};

//queue when retry
let refreshTokenPromise = null;

//TODO await have backend  Interceptor  handle response

api.interceptors.response.use(
   // 1. Hàm cho các response thành công (status 2xx)
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status
    console.warn('error api', error);
    if (
      status === 401 &&
      booleanRefresh(originalRequest._retry)
    ) {
      const refreshToken = getAuth();
      originalRequest._retry = generateNewRetry(originalRequest._retry);
      if (refreshTokenPromise) {
        console.log(refreshTokenPromise);
        return refreshTokenPromise.then(() => {
          return api(originalRequest);
        });
      }
      //TODO retry after refresh token
      refreshTokenPromise = api
        .post(REFRESH, {
          refreshToken,
        })
        .then((data) => {
          store.dispatch(setAuthInfo(data));
          sessionStorage.setItem(
            'grantType',
            JSON.stringify(data.token.grantType),
          );
          sessionStorage.setItem(
            'accessToken',
            JSON.stringify(data.token.accessToken),
          );
          return Promise.resolve(data);
        })
        .catch((errorRf) => {
          console.error('Refresh token failed', errorRf);
          store.dispatch(cleanAuthInfo());
          return Promise.reject(error);
        })
        .finally(() => {
          refreshTokenPromise = null;
        });
      return refreshTokenPromise.then(() => {
        return api(originalRequest);
      });
    }


      if (status === 403) {
        // Xử lý lỗi Forbidden
        // Có thể hiển thị một thông báo chung
      }
    alert(
        'Have some errors, please try again',
    );
    return Promise.reject(error);
  },
);
export default api;
