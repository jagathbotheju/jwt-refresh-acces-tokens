const Employee = require("../models/Employee");
const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/ErrorResponse");

exports.getAllEmployees = asyncHandler(async (req, res, next) => {
  const employees = await Employee.find();
  if (!employees) return next(new ErrorResponse("Employees not found", 204));
  res.status(200).json({
    employees,
    success: true,
  });
});

exports.createNewEmployee = asyncHandler(async (req, res, next) => {
  if (!req?.body?.firstname || !req?.body?.lastname) {
    return next(new ErrorResponse("First Name and Last Name required", 400));
  }

  const result = await Employee.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  });
  res.status(201).json({
    employees,
    success: true,
  });
});

exports.updateEmployee = asyncHandler(async (req, res, next) => {
  if (!req?.body.id) {
    return next(new ErrorResponse("Employee ID required", 400));
  }

  const employee = await Employee.findById({ _id: req.body.id });
  if (!employee) return next(new ErrorResponse("Employee not found", 204));
  const updatedEmployee = await employee.updateOne(
    {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    },
    { new: true }
  );

  res.status(201).json({
    updatedEmployee,
    success: true,
  });
});

exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  if (!req?.body.id) {
    return next(new ErrorResponse("Employee ID required", 400));
  }

  const employee = await Employee.findById({ _id: req.body.id });
  if (!employee) return next(new ErrorResponse("Employee not found", 204));
  await employee.deleteOne();
  res.status(200).json({
    success: true,
    message: "Employee deleted successfully",
  });
});

exports.getEmployee = asyncHandler(async (req, res, next) => {
  if (!req?.params.id) {
    return next(new ErrorResponse("Employee ID required", 400));
  }
  const employee = await Employee.findById({ _id: req.params.id });
  if (!employee) return next(new ErrorResponse("Employee not found", 204));

  res.status(200).json({
    employee,
    success: true,
  });
});
