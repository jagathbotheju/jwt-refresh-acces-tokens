const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const handleLogout = asyncHandler(async (req, res, next) => {
  //on client delete accessToken
  const cookies = req.cookies;
  if (!cookies.jwt) return res.sendStatus(204); //no content
  const refreshToken = cookies.jwt;

  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("jwt", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.sendStatus(204); //successfull but no content
  }

  //delete refresh token in DB
  await user.updateOne({ refreshToken: "" });
  //secuire:true , only servers on https
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
});

const handleRefreshToken = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies.jwt) return next(new ErrorResponse("Not Authorized", 401));
  const refreshToken = cookies.jwt;

  const user = await User.findOne({ refreshToken });
  if (!user) return next(new ErrorResponse("Not Authorized", 403));

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      return next(new ErrorResponse("Not Authorized", 403));
    }
    const accessToken = jwt.sign(
      {
        userInfo: {
          id: user._id,
          roles: user.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );
    res.json({ accessToken });
  });
});

const getUser = asyncHandler(async (req, res) => {
  //req.use.id - we set user is to req in authMiddleware
  console.log(`getUser req id ${req.id}`);
  const { _id, name, email, roals } = await User.findById(req.id);

  res.status(200).json({
    id: _id,
    name,
    email,
    roals,
  });
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse("User not found", 400));
  }

  const isPasswordValid = await user.comparePassword(password);

  if (isPasswordValid) {
    const accessToken = jwt.sign(
      {
        userInfo: {
          id: user._id,
          roles: user.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    await user.updateOne({ refreshToken });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      //secure: true, //should turn on this in production
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
      },
      success: true,
      accessToken,
    });
  } else {
    return next(new ErrorResponse("Invalid credentials", 400));
  }
});

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorResponse("Please add all fields", 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorResponse("User already exists", 400));
  }

  user = new User({
    name,
    email,
    password,
  });
  user = await user.save();

  if (user) {
    res.status(201).json({
      success: true,
      message: "Registration success, please Login",
    });
  } else {
    return next(new ErrorResponse("Invalid user data", 400));
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUser,
  handleRefreshToken,
  handleLogout,
};
