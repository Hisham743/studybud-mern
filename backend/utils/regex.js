const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const topicRegex = (topicName) => {
  return { $regex: `^${escapeRegex(topicName)}$`, $options: 'im' };
};

const queryRegex = (query) => {
  return { $regex: escapeRegex(query), $options: 'i' };
};

module.exports = { topicRegex, queryRegex };
