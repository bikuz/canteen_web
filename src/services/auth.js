// src/services/auth.js
// import axios from 'axios';

// export async function login(username, password) {
//   const response = await axios.post('http://localhost:3000/api/auth/login', { username, password });
//   const token = response.data.access_token;
//   localStorage.setItem('jwt_token', token);
//   return token;
// }

// export function logout() {
//   localStorage.removeItem('jwt_token');
// }

// export function getToken() {
//   return localStorage.getItem('jwt_token');
// }


  export function getToken() {
    return localStorage.getItem('token');
  }
  
  export function setToken(token) {
    localStorage.setItem('token', token);
  }
  
  export function removeToken() {
    localStorage.removeItem('token');
  }
  