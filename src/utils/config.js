
let BASE_URL;

if (import.meta.env.PROD) {
    BASE_URL = 'https://api.example.com';
} else {
    BASE_URL = import.meta.env.VITE_API_URL || '';
}

const RETRY_API = 1
export { BASE_URL, RETRY_API };