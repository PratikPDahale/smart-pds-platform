const getApiErrorMessage = (error, fallbackMessage) => {
  const validationErrors = error?.response?.data?.data;

  if (validationErrors && typeof validationErrors === 'object') {
    const firstError = Object.values(validationErrors).find(Boolean);
    if (firstError) {
      return firstError;
    }
  }

  return error?.message || error?.response?.data?.message || fallbackMessage;
};

export default getApiErrorMessage;
