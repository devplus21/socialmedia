exports.getUser = async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    let user;
    if (userId) {
      user = await User.findOne({ _id: userId });
    } else {
      if (username) {
        user = await User.findOne({ username: username });
      }
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.putListUser = async (req, res) => {
  /*vi get method k co body */
  const userIds = req.body.userIds;
  try {
    const userList = await Promise.all(
      userIds.map((userId) => {
        return User.findOne({ _id: userId });
      })
    );
    res.status(200).json(userList);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getIDFriends = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });
    const friendIds = user.friendIds;
    const friends = await Promise.all(
      friendIds.map((id) => {
        return User.findOne({ _id: id }, { _id: 1, firstName: 1, lastName: 1, avatar: 1 });
      })
    );
    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json(error);
  }
};
