const subjectTemplate = (req, i) => {
  return {
    name: `SUBJECT ${i}`,
    days: [],
    totalClasses: 0,
    classesBunked: 0,
    semester: req.body.semester,
    owner: req.user.redId,
    subjectType: "regular",
  };
};

module.exports = subjectTemplate;
