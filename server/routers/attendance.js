const express = require("express");
const router = new express.Router();
const auth = require("../middlewares/auth");
const {
  createNewAttendance,
  updateAttendanceById,
  getAttendanceBySubject,
} = require("../controller/attendance");
const subjectRequest = require("../middlewares/subjectRequest");

router.post("/api/subject/attendance/:id", auth, createNewAttendance);
router.patch("/api/subject/attendance/:id", auth, updateAttendanceById);
router.get("/api/subject/attendance/:id", auth, subjectRequest, getAttendanceBySubject);

module.exports = router;
