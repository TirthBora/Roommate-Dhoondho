import needRoommateModel from "../Models/needRoommate.js";

// Create new Roommate
export const createRoommate = async (req, res) => {

  const id = req.params.userid;



  // Check if the request has an 'Origin' header

  const url = req.get('Origin');

  console.log('Domain:', url);



  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {

    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });

    return;

  }



  const {userId} = req.body;

  const newRoommate = new needRoommateModel(req.body);



  try {
    if (id===userId) {
      console.log(newRoommate.remaining,newRoommate.preferredBed);
      if(newRoommate.remaining>newRoommate.preferredBed){
        res.status(401).json("Cannot have more availabilities than room size");
        return;

      }
      await newRoommate.save();
      res.status(200).json("Roommate created!");
    } 
    else {
      res.status(403).json("Action forbidden");
    }
  }
  catch (error) {
    res.status(500).json(error);
  }
};



// Get Roommate
export const getRoommate = async (req, res) => {
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
    if (userId === id) {
      const Roommate = await needRoommateModel.find({"userId":id});
      res.status(200).json(Roommate);
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get all Roommates
export const getAllRoommate = async (req, res) => {
  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 10; 
    const skip = page * limit;

    // Fix: Validate that req.query.sort exists and isn't just an empty string
    let sortParam = req.query.sort;
    let sortField = "createdAt";
    let sortOrder = -1;

    if (sortParam && sortParam.trim() !== "") {
      const parts = sortParam.split(",");
      sortField = parts[0] || "createdAt";
      sortOrder = parts[1] === "asc" ? 1 : -1;
    }

    let sortBy = { [sortField]: sortOrder };

    let query = {};

    if (req.query.gender && req.query.gender !== "All") {
      query.gender = { $in: req.query.gender.split(",") };
    }

    if (req.query.year && req.query.year !== "All") {
      query.year = { $in: req.query.year.split(",") };
    }

    if (req.query.preferredBlock && req.query.preferredBlock !== "All") {
      query.preferredBlock = { $in: req.query.preferredBlock.split(",") };
    }

    const roommates = await needRoommateModel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    res.status(200).json(roommates);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a Roommate
export const updateRoommate = async (req, res) => {
  const id = req.params.id;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { userId,roomId } = req.body;
  console.log(userId);
  try {
    const roommate = await needRoommateModel.findById(roomId);
    console.log(roommate);
    console.log(roommate.userId,userId);
    if (roommate.userId.toString() === id) {
      await roommate.updateOne({ $set: req.body });
      res.status(200).json("Roommate Updated");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Delete a Roommate
export const deleteRoommate = async (req, res) => {
  const url = req.get('Origin');
  const id = req.params.id;

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { userId, roomId } = req.body;

  try {
    
    const roommate = await needRoommateModel.findById(roomId);

    if (!roommate) {
      res.status(404).json("Roommate record not found");
      return;
    }
    console.log(roommate.userId,userId);
    if (roommate.userId.toString() === id) {
      await roommate.deleteOne();
      res.status(200).json("Roommate deleted successfully");
    } else {
      res.status(403).json("Action forbidden: You do not own this record");
    }
    
  } catch (error) {
    res.status(500).json(error);
  }
};