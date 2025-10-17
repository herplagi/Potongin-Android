import api from './api';
// export const login = (email, password) =>
//   api.post('/auth/login', { email, password });
// export const register = userData => api.post('/auth/register', userData);

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response;
  } catch (error) {
    console.error(
      'Login service error:',
      error.response?.data || error.message,
    );
    throw error;
  }
};
export const register = async userData => {
  try {
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
    console.error(
      'Register service error:',
      error.response?.data || error.message,
    );
    throw error;
  }
};
