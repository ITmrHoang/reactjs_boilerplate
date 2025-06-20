
let BASE_URL;

if (import.meta.env.PROD) {
    BASE_URL = 'https://api.example.com';
} else {
    BASE_URL = 'http://localhost:8080/api';
}

export { BASE_URL };