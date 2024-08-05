const express = require("express");
const router = new express.Router();
const auth = require("../middlewares/auth");
const subjectRequest = require("../middlewares/subjectRequest");

const {
  getAllSemester,
  createNewSubject,
  editSubject,
  removeSubject,
  createTemplates,
  getSubjectBySemester,
  deactivateSubject,
  deactivateAllSubjects,
} = require("../controller/subject");




router.post('/api/subject/new', auth, createNewSubject);
router.post("/api/subject/createTemplate", auth, createTemplates);
router.get("/api/subject/:semester", auth, getSubjectBySemester);
router.get("/api/semester/all", auth, getAllSemester);

//router.get('/api.getSubject', auth,getSubject);
router.patch("/api/subject/:id", auth, subjectRequest, editSubject);
router.delete("/api/subject/:id", auth, subjectRequest, removeSubject);

//semester
router.patch("/api/subject/deactivate/:id", auth, deactivateSubject);
router.patch("/api/semester/deactivate", auth, deactivateAllSubjects);

module.exports = router;
