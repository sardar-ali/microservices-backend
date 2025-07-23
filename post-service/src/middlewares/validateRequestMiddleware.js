// middlewares/validateRequest.js
module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema(req.body);
    console.log("Error Middleware ::", error);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};
