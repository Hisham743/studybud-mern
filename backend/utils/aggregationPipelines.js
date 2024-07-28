const { topicRegex, queryRegex } = require('./regex');

const userDetailsPipeline = [
  {
    $project: {
      _id: 1,
      isDeleted: 1,
      conditionalFields: {
        $cond: {
          if: { $eq: ['$isDeleted', true] },
          then: '$$REMOVE',
          else: {
            name: '$name',
            username: '$username',
            email: '$email',
            bio: '$bio',
            avatar: '$avatar',
            rooms: '$rooms',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
          },
        },
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          '$conditionalFields',
          { _id: '$_id', isDeleted: '$isDeleted' },
        ],
      },
    },
  },
];

const roomListDetailsPipeline = [
  {
    $lookup: {
      from: 'topics',
      localField: 'topic',
      foreignField: '_id',
      as: 'topic',
    },
  },
  { $unwind: '$topic' },
  {
    $lookup: {
      from: 'users',
      localField: 'host',
      foreignField: '_id',
      pipeline: userDetailsPipeline,
      as: 'host',
    },
  },
  { $unwind: '$host' },
];

const roomDetailsPipeline = [
  ...roomListDetailsPipeline,
  {
    $lookup: {
      from: 'users',
      localField: 'participants',
      foreignField: '_id',
      pipeline: userDetailsPipeline,
      as: 'participants',
    },
  },
];

const messageDetailsPipeline = [
  {
    $lookup: {
      from: 'users',
      localField: 'sender',
      foreignField: '_id',
      pipeline: userDetailsPipeline,
      as: 'sender',
    },
  },
  { $unwind: '$sender' },
  {
    $lookup: {
      from: 'rooms',
      localField: 'room',
      foreignField: '_id',
      pipeline: roomListDetailsPipeline,
      as: 'room',
    },
  },
  { $unwind: '$room' },
];

const queryRoomsPipeline = (query, topicName = null) => {
  return [
    ...roomListDetailsPipeline,
    ...(topicName ? [{ $match: { 'topic.name': topicRegex(topicName) } }] : []),
    ...(query
      ? [
          {
            $match: {
              $or: [
                { name: queryRegex(query) },
                { description: queryRegex(query) },
                { 'topic.name': queryRegex(query) },
                { 'host.username': queryRegex(query) },
              ],
            },
          },
        ]
      : []),
    { $sort: { 'updatedAt': -1, 'createdAt': -1 } },
  ];
};

const queryMessagesPipeline = (query, topicName = null) => {
  return [
    ...messageDetailsPipeline,
    ...(topicName
      ? [{ $match: { 'room.topic.name': topicRegex(topicName) } }]
      : []),
    ...(query
      ? [
          {
            $match: {
              $or: [
                { body: queryRegex(query) },
                { 'sender.name': queryRegex(query) },
                { 'room.name': queryRegex(query) },
                { 'room.topic.name': queryRegex(query) },
              ],
            },
          },
        ]
      : []),
    { $sort: { 'createdAt': -1 } },
  ];
};

module.exports = {
  userDetailsPipeline,
  roomListDetailsPipeline,
  roomDetailsPipeline,
  messageDetailsPipeline,
  queryRoomsPipeline,
  queryMessagesPipeline,
};
