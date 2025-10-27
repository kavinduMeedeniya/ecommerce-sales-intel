import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ecommerce-sales-intel.onrender.com',  // Fixed: Single "http://"
});

export { api };
