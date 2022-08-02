const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/ErrorResponse");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer "))
    return next(new ErrorResponse("Not Authorizd", 401));
  const token = authHeader.split(" ")[1]; //Barer token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return next(new ErrorResponse("Forbittened", 403)); //invalid token
    req.id = decoded.userInfo.id;
    req.roles = decoded.userInfo.roles;
    next();
  });
};

module.exports = protect;
