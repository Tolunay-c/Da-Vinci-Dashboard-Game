import axios from 'axios';

// Types
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
}

export interface Post {
  id: number;
  title: string;
  content: string;
  userId: number;
}

// User API'leri
export const getUsers = async (): Promise<User[]> => 
  axios.get('http://localhost:3000/users').then(res => res.data);

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => 
  axios.post('http://localhost:3000/users', user).then(res => res.data);

export const updateUser = async (id: number, fields: Partial<User>): Promise<User> => 
  axios.patch(`http://localhost:3000/users/${id}`, fields).then(res => res.data);

export const deleteUser = async (id: number) => 
  axios.delete(`http://localhost:3000/users/${id}`).then(res => res.data);

// Post API'leri
export const getPosts = async (): Promise<Post[]> => 
  axios.get('http://localhost:3000/posts').then(res => res.data);

export const addPost = async (post: Omit<Post, 'id'>): Promise<Post> => 
  axios.post('http://localhost:3000/posts', post).then(res => res.data);

export const updatePost = async (id: number, fields: Partial<Post>): Promise<Post> => 
  axios.patch(`http://localhost:3000/posts/${id}`, fields).then(res => res.data);

export const deletePost = async (id: number) => 
  axios.delete(`http://localhost:3000/posts/${id}`).then(res => res.data);
