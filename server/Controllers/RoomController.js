import needRoomModel from "../Models/needRoom.js";

// Create new Room
export const createRoom = async (req, res) => {
  const id = req.params.userid;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { userId } = req.body;
  const newRoom = new needRoomModel(req.body);
  

  try {
    if (id === userId) {
      await newRoom.save();
      res.status(200).json("Room created!");
    } else {
      res.status(403).json("Action forbidden");
    }
  }
  catch (error) {
    res.status(500).json(error);
  } 
};

// Get Room
export const getRoom = async (req, res) => {
  const id = req.params.userid;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { userId } = req.body;

  try {
    if (id === userId) {
      const Room = await needRoomModel.find({userId: id});
      res.status(200).json(Room);
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get all Rooms
export const getAllRoom = async (req, res) => {

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10000000;
    const skip = page * limit;

    let sort = req.query.sort || "createdAt";

    req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);
    let sortBy = {};
    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "asc";
    }

    let gender = req.query.gender || "All";
    const genderOptions = ["M", "F"];

    gender === "All"
      ? (gender = [...genderOptions])
      : (gender = gender.split(","));

    let year = req.query.year || "All";
    const yearOptions = [1, 2, 3, 4];

    year === "All" ? (year = [...yearOptions]) : (year = year.split(","));

    let preferredBlock = req.query.preferredBlock || "All";

    const blockOptions = [
      "A",
      "B",
      "B ANNEX",
      "C",
      "D",
      "D ANNEX",
      "E",
      "F",
      "G",
      "H",
      "J",
      "K",
      "L",
      "M",
      "M ANNEX",
      "N",
      "P",
      "Q",
      "R",
      "S",
      "T",
    ];

    preferredBlock === "All"
      ? (preferredBlock = [...blockOptions])
      : (preferredBlock = preferredBlock.split(","));

    const rooms = await needRoomModel
      .where("gender")
      .in([...gender])
      .where("year")
      .in([...year])
      .where("preferredBlock")
      .in([...preferredBlock])
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Update a Room
export const updateRoom = async (req, res) => {
  const id = req.params.id;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { userId } = req.body;

  try {
    const Room = await needRoomModel.findById(id);
    if (Room.userId === userId) {
      await Room.updateOne({ $set: req.body });
      res.status(200).json("Room Updated");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Delete a Room
export const deleteRoom = async (req, res) => {
  const id = req.params.id;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { userId } = req.body;

  try {
    const Room = await needRoomModel.findById(id);
    console.log("Room userId: ", Room.userId, " userId: ", userId);
    if (Room.userId.toString() === userId) {
      await Room.deleteOne();
      res.status(200).json("Room deleted successfully");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
