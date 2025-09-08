import axios from 'axios';

export const getUsers = async () => axios.get('http://localhost:3000/users').then(res => res.data);
export const addUser = async (user) => axios.post('http://localhost:3000/users', user).then(res => res.data);
export const updateUser = async (id, fields) => axios.patch(`http://localhost:3000/users/${id}`, fields).then(res => res.data);
export const deleteUser = async (id) => axios.delete(`http://localhost:3000/users/${id}`).then(res => res.data);

export const getPosts = async () => axios.get('http://localhost:3000/posts').then(res => res.data);
export const addPost = async (post) => axios.post('http://localhost:3000/posts', post).then(res => res.data);
export const updatePost = async (id, fields) => axios.patch(`http://localhost:3000/posts/${id}`, fields).then(res => res.data);
export const deletePost = async (id) => axios.delete(`http://localhost:3000/posts/${id}`).then(res => res.data);
