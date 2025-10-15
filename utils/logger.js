export const logRequest = async (req, res, next) => {
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Body: ${JSON.stringify(req.body)}`);
  next();
};
