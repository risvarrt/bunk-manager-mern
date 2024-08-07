import axios from "axios";

const attendanceUrl =
  "http://bunk-be-asg-final-load-1502554748.us-east-1.elb.amazonaws.com:5000/api/subject/attendance";

export const createAttendance = (header, data, id) =>
  axios.post(`${attendanceUrl}/${id}`, { data }, { headers: header });

export const editAttendance = (header, data, id) =>
  axios.patch(`${attendanceUrl}/${id}`, { data }, { headers: header });

export const getAttendance = (header, id) =>
  axios.get(`${attendanceUrl}/${id}`, { headers: header });
