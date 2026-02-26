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
  const url = req.get('Origin');

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    return res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
  }

  try {
    let { 
      page = 1, 
      limit = 10, 
      sort = "createdAt", 
      order = "desc", 
      gender, 
      year, 
      preferredBlock, 
      search 
    } = req.query;

    // Fix: Ensure sort is not an empty string
    if (!sort || sort.trim() === "") {
      sort = "createdAt";
    }

    const query = {};

    if (gender && gender !== "All") {
      query.gender = { $in: gender.split(",") };
    }

    if (year && year !== "All") {
      query.year = { $in: year.split(",") };
    }

    if (preferredBlock && preferredBlock !== "All") {
      query.preferredBlock = { $in: preferredBlock.split(",") };
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { habits: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "desc" ? -1 : 1;
    
    // This now uses a guaranteed non-empty string
    const sortOptions = { [sort]: sortOrder };

    const rooms = await needRoomModel
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

  const { roomId } = req.body;

  try {
    const Room = await needRoomModel.findById(roomId);
    console.log(Room.userId.toString(),id);
    if (Room.userId.toString() === id) {
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

  const { userId,roomId } = req.body;

  try {
    const Room = await needRoomModel.findById(roomId);
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
