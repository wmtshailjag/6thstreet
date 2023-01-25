const appendToStr = (str1, str2, separator = ',') => {
  const sep = str1 ? separator : '';
  const v1 = str1 || '';
  const v2 = str2 || '';
  return `${v1}${sep}${v2}`;
};

export { appendToStr };
