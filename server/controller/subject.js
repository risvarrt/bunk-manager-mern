const {
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getSubjectsBySemester,
  deactivateSubjects,
  getAllSemesters
} = require('../models/subject');
const { uploadToS3 } = require('../utils/s3');
const svgFile = require('../utils/svgFile');
const subjectTemplate = require('../utils/subjectTemplate');
const labTemplate = require('../utils/labTemplate');


// Creating new subject
const createNewSubject = async (req, res) => {
  try {
    const subjectData = { ...req.body, owner: req.user.regdId };
    subjectData.backgroundImage = await svgFile();

    const subject = await createSubject(subjectData);
    res.status(201).send(subject);
  } catch (e) {
    res.status(400).send({ msg: "FAILED TO CREATE SUBJECT", error: e.message });
  }
};

// Editing subject
const editSubject = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "days", "semester", "subjectType","totalClasses","classesbunked"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({ msg: "Invalid Update" });
  }

  try {
    const subject = await getSubjectById(req.subject.id);
    if (!subject || subject.owner !== req.user.regdId) {
      return res.status(404).send({ msg: "Subject not found" });
    }

    const updatedSubject = await updateSubject(req.subject.id, req.body);
    res.status(200).send(updatedSubject);
  } catch (e) {
    res.status(400).send({ msg: "UPDATE FAILED", error: e.message });
  }
};



// Deleting subject
const removeSubject = async (req, res) => {
  try {
    const subject = await getSubjectById(req.subject.id);
    if (!subject || subject.owner !== req.user.regdId) {
      return res.status(404).send({ msg: "Subject not found" });
    }

    await deleteSubject(req.subject.id);
    res.status(200).send(subject);
  } catch (e) {
    res.status(400).send({ msg: "SUBJECT NOT DELETED", error: e.message });
  }
};

// Creating templates
const createTemplates = async (req, res) => {
  try {
    for (let i = 0; i < 5; i++) {
      const subjectData = subjectTemplate(req, i);
      subjectData.backgroundImage = svgFile();
      await createSubject(subjectData);

      if (i < 4) {
        const labData = labTemplate(req, i);
        labData.backgroundImage = svgFile();
        await createSubject(labData);
      }
    }
    res.status(201).send();
  } catch (e) {
    res.status(500).send({ msg: e.message });
  }
};

const getSubjectBySemester = async (req, res) => {
  try {
    const owner = req.user.regdId; // Ensure this is correctly populated
    const semester = req.params.semester; // Ensure this is correctly populated
    if (!owner || !semester) {
      return res.status(400).send({ msg: "Owner and semester are required." });
    }

    const subjects = await getSubjectsBySemester(owner, semester);
    res.status(200).send(subjects);
  } catch (e) {
    res.status(400).send({ msg: "Unable to fetch subjects", error: e.message });
  }
};

// Deactivate subjects
const deactivateSubject = async (req, res) => {
  try {
    const updatedSubject = await updateSubject(req.params.id, { active: false });
    res.status(200).send(updatedSubject);
  } catch (e) {
    res.status(400).send({ msg: "Bad Request", error: e.message });
  }
};

const getAllSemester = async (req, res) => {
  try {
    const owner = req.user.regdId;
    const semesters = await getAllSemesters(owner);
    if (semesters.length === 0) {
      return res.status(400).send({ msg: "No semester found" });
    }
    res.status(200).send(semesters);
  } catch (e) {
    res.status(400).send({ msg: "Unable to fetch semesters", error: e.message });
  }
};

// Deactivate all subjects
const deactivateAllSubjects = async (req, res) => {
  try {
    const subjects = await deactivateSubjects(req.user.regdId, req.body.semester);
    res.status(200).send(subjects);
  } catch (e) {
    res.status(400).send({ msg: "Bad Request", error: e.message });
  }
};

module.exports = {
  getAllSemester,
  createNewSubject,
  editSubject,
  removeSubject,
  createTemplates,
  getSubjectBySemester,
  deactivateSubject,
  deactivateAllSubjects,
};
