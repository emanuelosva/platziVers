// --- Test responses functions
const response = (data, message, error) => {
  return {
    error,
    message,
    body: data,
  };
};

module.exports = { response };
