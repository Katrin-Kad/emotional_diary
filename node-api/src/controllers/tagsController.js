const TAGS = ['учёба', 'работа', 'отношения', 'здоровье', 'друзья', 'семья', 'отдых'];

exports.getTags = (req, res) => {
  res.json(TAGS);
};
