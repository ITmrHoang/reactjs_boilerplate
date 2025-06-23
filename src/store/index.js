import { configureStore } from '@reduxjs/toolkit';

//NOTE set require.context run when testing in node environment /webpack  => open when testing

// if (typeof require.context === 'undefined') {
//   const fs = require('fs');
//   const path = require('path');

//   require.context = (
//     base = '.',
//     scanSubDirectories = false,
//     regularExpression = /\.js$/,
//   ) => {
//     const files = {};

//     function readDirectory(directory) {
//       fs.readdirSync(directory).forEach((file) => {
//         const fullPath = path.resolve(directory, file);

//         if (fs.statSync(fullPath).isDirectory()) {
//           if (scanSubDirectories) readDirectory(fullPath);
//           return 1;
//         }

//         if (!regularExpression.test(`./${file}`)) return;
//         files[fullPath] = true;
//       });
//     }
//     readDirectory(path.resolve(__dirname, base));

//     function Module(file) {
//       return require(path.resolve(__dirname, base, file));
//     }

//     Module.keys = () =>
//       Object.keys(files).map((filePath) => path.basename(filePath));

//     return Module;
//   };
// }

// // Dynamically import all reducers from the modules folder
// const modules = require.context('./modules', false, /\.\/\S+\.js$/);
// // console.log('modules', modules, modules.keys());
// const reducers = modules.keys().reduce((acc, key) => {
//   const reducerName = key.replace('./', '').replace('.js', '');
//   acc[reducerName] = modules(key).default ?? {};
//   return acc;
// }, {});

// in vite dynamic import
const modules = import.meta.glob('./modules/*.js', { eager: true });
const reducers = Object.keys(modules).reduce((acc, path) => {
  // Lấy tên reducer từ đường dẫn file, ví dụ: './modules/user.js' -> 'user'
  const reducerName = path.replace('./modules/', '').replace('.js', '');

  // Gán default export của module vào object accumulator
  acc[reducerName] = modules[path].default;
  
  return acc;
}, {});
export const setupStore = (preloadedState) => {
  return configureStore({
    reducer: reducers,
    preloadedState,
  });
};

export const store = setupStore();
