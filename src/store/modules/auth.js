import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from 'utils/api';
import { LOGIN, LOGOUT, REFRESH, REGISTER, USER_MENU } from 'utils/url';

const NAME = 'auth'
// TODO register
export const register = createAsyncThunk(
  'auth/register',
  async (params, thunkAPI) => {
    try {
      await api.post(REGISTER, params);
      return true;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue('register error');
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ emailAddress, password }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setLoading(true));
      const data = await api.post(LOGIN, { userEmail: emailAddress, password });
      thunkAPI.dispatch(setLoading(true));
      return thunkAPI.fulfillWithValue(data);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      console.warn(message);
      return thunkAPI.rejectWithValue();
    }
  },
);

export const refresh = createAsyncThunk(
  'auth/reissue',
  async (params, thunkAPI) => {
    try {
      const refreshToken = getAuth();
      if (refreshToken) {
        thunkAPI.dispatch(setLoading(true));
        const data = await api.post(REFRESH, {
          refreshToken,
        });
        thunkAPI.dispatch(setAuthInfo(data));
        thunkAPI.dispatch(setLoading(false));
        return thunkAPI.fulfillWithValue(data);
      } else {
        console.warn('No refresh token found, unable to refresh');
        thunkAPI.dispatch(cleanAuthInfo());
        return thunkAPI.rejectWithValue();
      }
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      console.warn(message);
      thunkAPI.dispatch(cleanAuthInfo());
      return thunkAPI.rejectWithValue();
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (params, thunkAPI) => {
    try {
      const refreshToken = getAuth();
      const data = await api.post(LOGOUT, { refreshToken });
      thunkAPI.dispatch(cleanAuthInfo());
      return thunkAPI.fulfillWithValue(data);
    } catch (error) {
      console.warn(error);
      thunkAPI.dispatch(cleanAuthInfo());
      return thunkAPI.rejectWithValue();
    }
  },
);


export const getAuth = () => {
  return localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth'))
    : null;
};

export const getAccessToken = () => {
  return sessionStorage.getItem('accessToken')
    ? JSON.parse(sessionStorage.getItem('accessToken'))
    : null;
};

export const getGrantType = () => {
  return sessionStorage.getItem('grantType')
    ? JSON.parse(sessionStorage.getItem('grantType'))
    : null;
};
const createInitalState = function () {
  const auth = getAuth();
  const grantType = getGrantType();
  const accessToken = getAccessToken();
  const isLoggedIn = localStorage.getItem('isLoggedIn')
    ? JSON.parse(localStorage.getItem('isLoggedIn'))
    : false;
  const user = JSON.parse(sessionStorage.getItem('user'));
  return {
    loading: true,
    isLoggedIn: isLoggedIn,
    accessToken: accessToken,
    auth: auth,
    grantType: grantType,
    user: user,
    permissions: [],
  };
};

const initialState = createInitalState();

const authSlice = createSlice({
  name: NAME,
  initialState,
  reducers: {
    setAuthInfo: (state, action) => {
      const auth = action.payload.token.refreshToken;
      const accessToken = action.payload.token.accessToken;
      const grantType = action.payload.token.grantType;
      const user = action.payload.user;
      localStorage.setItem('auth', JSON.stringify(auth));
      localStorage.setItem('isLoggedIn', true);
      sessionStorage.setItem('grantType', JSON.stringify(grantType));
      sessionStorage.setItem('accessToken', JSON.stringify(accessToken));
      sessionStorage.setItem('user', JSON.stringify(user));
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload.user,
        auth,
        accessToken,
        grantType,
        token: action.token,
      };
    },
    cleanAuthInfo: (state) => {
      localStorage.setItem('isLoggedIn', false);
      localStorage.removeItem('auth');
      sessionStorage.clear();
      const initialState = createInitalState();
      return { ...state, ...initialState };
    },
    setLoading: (state, action) => {
      return {
        ...state,
        loading: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(register.fulfilled, (state) => {
      state.isLoggedIn = false;
      state.loading = false;
    });
    builder.addCase(register.rejected, (state) => {
      state.isLoggedIn = false;
      state.loading = false;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      Object.assign(state, {
        ...state,
        loading: false,
        isLoggedIn: true,
        auth: action.payload.token.refreshToken,
        accessToken: action.payload.token.accessToken,
        grantType: action.payload.token.grantType,
        user: action.payload.user,
        token: action.payload.token,
      });
    });
    builder.addCase(login.rejected, (state) => {
      state.isLoggedIn = false;
      state.loading = false;
      cleanAuthInfo();
    });
  },
});

// Action creators are generated for each case reducer function
export const { setAuthInfo, cleanAuthInfo, setLoading } = authSlice.actions;
export const selectUser = (state) => state[NAME].user;

// tạo memoized selector khi cần sử lý dữ liệu từ select
// Dùng createSelector để đảm bảo hiệu năng
// import { createSelector } from '@reduxjs/toolkit';
// export const selectUserName = createSelector(
//   [selectUser],
//   (user) => user.name
// );
const { reducer } = authSlice;
export default reducer;

//  example api 
// Define a thunk that dispatches those action creators
// const fetchUsers = () => async (dispatch) => {
//   dispatch(setLoading(true))
//   const response = await usersService.fetchAll()
//   dispatch(usersReceived(response.data))
// }
