const Message = require('../models/messageModel');
const Topic = require('../models/topicModel');
const { topicRegex } = require('../utils/regex');
const {
  messageDetailsPipeline,
  queryMessagesPipeline,
} = require('../utils/aggregationPipelines');

const getMessages = async (req, res) => {
  const { query, topic: topicName } = req.query;

  let topic;
  if (topicName) {
    topic = await Topic.findOne({ name: topicRegex(topicName) });
    if (!topic) {
      return res.status(200).json([]);
    }
  }

  let messages;
  if (topicName) {
    messages = topic
      ? await Message.aggregate(queryMessagesPipeline(query, topicName))
      : [];
  } else {
    messages = await Message.aggregate(queryMessagesPipeline(query));
  }

  res.status(200).json(messages);
};

const getMessage = async (req, res) => {
  const [message] = await Message.aggregate([
    { $match: { _id: req.message._id } },
    ...messageDetailsPipeline,
  ]);

  res.status(200).json(message);
};

const updateMessage = async (req, res) => {
  const { id } = req.params;
  const { isDeleted } = req.body;
  let { body } = req.body;
  const updateFields = {};

  if (isDeleted) {
    body = 'This message was deleted';
  }
  updateFields.isDeleted = isDeleted;
  updateFields.body = body;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    const [populatedMessage] = await Message.aggregate([
      { $match: { _id: updatedMessage._id } },
      ...messageDetailsPipeline,
    ]);

    return isDeleted
      ? res.status(204).send()
      : res.status(200).json(populatedMessage);
  } catch (error) {
    res.status(500).json({
      msg: 'An unexpected error occurred',
    });
  }
};

module.exports = {
  getMessages,
  getMessage,
  updateMessage,
};
