/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx,vue}",
    "./src/**/*.css",
  ],
  theme: {
    extend: {
      flex: {
        2: '2 2 0%',
      },
      colors: {

      },
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(96.51deg, #f34d78 19.96%, #ffbe89 112.55%)",
      },
      backgroundColor: {
        "custom-gradient":
          "linear-gradient(96.51deg, #f34d78 19.96%, #ffbe89 112.55%)",
      },
      boxShadow: {
        "gradient-shadow":
          "0px 2px 4px 0px #11111114, 0px 4px 8px 0px #ff2c6366",
        "sw-handle-shadow": "1px 1px 2px 0px #00000014",
      },
    },
  },
  plugins: [],
};
