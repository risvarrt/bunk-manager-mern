const { getSubjectById } = require('../models/subject');

const subjectRequest = async (req, res, next) => {
  try {
    const subject = await getSubjectById(req.params.id);
    if (!subject) {
      return res.status(404).send({ msg: "Subject not found" });
    }
    req.subject = subject;
    next();
  } catch (e) {
    res.status(500).send({ msg: "Unable to fetch subject", error: e.message });
  }
};

module.exports = subjectRequest;
