const Topic = require('../models/topicModel');

const getTopics = async (req, res) => {
  const topics = await Topic.aggregate([
    {
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: 'topic',
        as: 'rooms',
      },
    },
    {
      $project: {
        'name': 1,
        'roomCount': { $size: '$rooms' },
      },
    },
    { $sort: { roomCount: -1, name: 1 } },
  ]);

  res.status(200).json(topics);
};

const createTopic = async (req, res) => {
  const { name } = req.body;

  try {
    const topic = await Topic.create({ name });
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ msg: 'An unexpected error occurred' });
  }
};

module.exports = { getTopics, createTopic };
