const inValidateCache = async (req, key) => {
  const keys = await req.redisClient.keys(key); // returns an array of matching keys
  if (keys.length > 0) {
    await req.redisClient.del(...keys); // delete all matching keys at once
  }
};

module.exports = { inValidateCache };
