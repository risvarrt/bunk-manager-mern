const {
  createAttendance,
  getAttendancesBySubject,
  updateAttendance,
} = require('../models/attendance');
const { getSubjectById } = require('../models/subject');

// Create attendance
const createNewAttendance = async (req, res) => {
  try {
    const subject = await getSubjectById(req.params.id);
    if (!subject) {
      return res.status(404).send({ msg: "No Such Subject found to create attendance of" });
    }

    const attendance = await createAttendance({
      ...req.body,
      attendanceOf: req.params.id,
    });

    res.status(201).send(attendance);
  } catch (e) {
    res.status(400).send({ msg: "Attendance Creation Failed", error: e.message });
  }
};

// Edit attendance
const updateAttendanceById = async (req, res) => {
  const updates = Object.keys(req.body);
  const isValid = updates.includes("classesBunked");
  if (!isValid) {
    return res.status(400).send({ msg: "Invalid updates!" });
  }
  try {
    const attendance = await updateAttendance(req.params.id, req.body);
    if (!attendance) {
      return res.status(404).send({ msg: "No such attendance found to update" });
    }
    res.status(200).send(attendance);
  } catch (e) {
    res.status(400).send({ msg: "Unable to update attendance", error: e.message });
  }
};

// Get attendance
const getAttendanceBySubject = async (req, res) => {
  try {
    const attendances = await getAttendancesBySubject(req.params.id);
    res.status(200).send(attendances);
  } catch (e) {
    res.status(400).send({ msg: "Unable to fetch attendance", error: e.message });
  }
};

module.exports = {
  createNewAttendance,
  updateAttendanceById,
  getAttendanceBySubject,
};
