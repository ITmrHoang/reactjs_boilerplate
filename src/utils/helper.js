// @ts-nocheck
export function mergeObjects() {
  Object.assign({}, ...arguments);
}

export function throttle(func, limit) {
  let inThrottle = false;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function debounce(fn, wait) {
  var timeout = null;
  function debouncedFunction() {
    const args = arguments;
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => fn.apply(context, args), wait);
  }
  debouncedFunction.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
  };
  return debouncedFunction;
}

export function once(func) {
  var ran = false,
    memo;
  return function () {
    if (ran) return memo;
    ran = true;
    memo = func.apply(this, arguments);
    func = null;
    return memo;
  };
}

/**
 * check is params is empty
 *
 * @param {any} target - param to check
 * @returns {boolean } - return boolean  check
 */
export function isEmpty(target) {
  return (
    typeof target === 'undefined' ||
    target === 0 ||
    target === '0' ||
    target === null ||
    target === 'undefined' ||
    target === '' ||
    target === 'null' ||
    target.length === 0 ||
    (typeof target === 'string' && target.trim() === '') ||
    (typeof target === 'object' && !Object.keys(target).length)
  );
}

export const isRequired = (target) =>
  target !== 'null' &&
  target !== null &&
  target !== undefined &&
  target !== 'undefined' &&
  target !== '';

export const isFunction = (value) =>
  value instanceof Function ||
  Object.prototype.toString.call(value) === '[object Function]' ||
  'function' === typeof value;

export const isArray = (variable) =>
  variable.constructor === Array ||
  variable instanceof Array ||
  Array.isArray(variable) ||
  Object.prototype.toString.call(variable) === '[object Array]';
export const isString = (value) =>
  value instanceof String ||
  'string' === typeof value ||
  Object.prototype.toString.call(value) === '[object String]';

export const isObject = (value) =>
  value instanceof Object ||
  'object' === typeof value ||
  Object.prototype.toString.call(value) === '[object Object]';
export const isNumber = (value) =>
  value instanceof Number ||
  typeof value === 'number' ||
  (!isNaN(Number(value)) && value !== '');

export function isIpAddress(ip) {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

export function isIpV4(ip) {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4Pattern.test(ip);
}
export function isIpV6(ip) {
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Pattern.test(ip);
}

export function isEmailAddress(string) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(string);
}

export function hasUpperCase(string) {
  return /[A-Z]/.test(string);
}

export function hasLowerCase(string) {
  return /[a-z]/.test(string);
}

export function hasSpecialChar(string) {
  return /[!@#$%^&*(),.?":{}|<>]/.test(string);
}

export function hasNumber(string) {
  return /[0-9]/.test(string);
}

export function isPhoneNumber(string) {
  return /^((\+\d{1,5})([-. ]?\d{3,4}){3})|(0\d{1,2}([-. ]?\d{3,4}){2})$/.test(
    string,
  );
}

export function isBlank(string) {
  return string === '';
}

export function getNestedValue(obj, path) {
  let _path = path ?? '';
  return _path.split('.').reduce((acc, part) => {
    return isObject(acc) ? acc?.[part] ?? acc : acc;
  }, obj);
}

export function snakeCaseToTitleCase(str) {
  return str.replace(/^[-_ ]*(.)|[-_ ]+(.)/g, (s, c, d) =>
    c ? c.toUpperCase() : ' ' + d.toUpperCase(),
  );
}

export function genKey(radix = 36, prefix = '') {
  const number = Math.floor(Math.random() * 10000);
  return `${prefix}-${Date.now().toString(radix)}-${number}`;
}

export function normalizePath(path) {
  return path.replace(/^\/*$/g, '/');
}

export function appendSlash(input) {
  return input.replace(/\/*$/, '/');
}

/**
Function to check if a specific path has access rights
@param {string} input - string path to check
@param {Array} paths - list of accessible paths
@return {boolean} Accessible
*/
export function hasAccess(input, paths) {
  let exactMatch = paths.some((path) => {
    const normalizedPath = normalizePath(path);
    return normalizedPath === input;
  });
  if (exactMatch) return true;
  return paths.some((path) => {
    const normalizedPath = normalizePath(path);
    if (normalizedPath === '/') return false;
    // If the path is the parent path of the allowed path
    if (input.startsWith(appendSlash(normalizedPath))) return true;
    return false;
  });
}

export function isEven(number) {
  return isNumber(number) && (number & 1) === 0;
}

export function isOdd(number) {
  return isNumber(number) && (number & 1) === 1;
}

export default {
  mergeObjects,
  throttle,
  debounce,
  isEmpty,
  isFunction,
  isArray,
  isString,
  isObject,
  isNumber,
  isIpAddress,
  isIpV4,
  isIpV6,
  isEmailAddress,
  isBlank,
  getNestedValue,
  genKey,
  hasAccess,
};
