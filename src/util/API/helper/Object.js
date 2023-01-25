export const isObject = (item) => item && typeof item === 'object';

export const queryString = (obj = {}) => Object.keys(obj)
    .map((key) => `${key}=${encodeURIComponent(obj[key])}`)
    .join('&');

export const clean = (obj = {}) => {
    const newObj = {};

    Object.keys(obj).forEach((key) => {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            newObj[key] = obj[key];
        }
    });

    return newObj;
};

export const merge = (target, ...sources) => {
    if (!sources.length){
        return target;
    }

    const source = sources.shift();
  
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          merge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  
    return merge(target, ...sources);
}
