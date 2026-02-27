import UserModel from "../Models/userModel.js";
import mongoose from "mongoose";
import needRoommateModel from "../Models/needRoommate.js"
import needRoomModel from "../Models/needRoom.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// get all Users
export const getAllUser = async (req, res) => {z
  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10000000;
    const skip = (page - 1) * limit;
    const users = await UserModel
      .find()
      .select('-password')
      .skip(skip)
      .limit(limit);

    // Extracting required fields for each user
    const extractedUsers = users.map(user => ({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      gender: user.gender,
      username: user.username,
      followers: user.followers,
      following: user.following,
      likesRoommate: user.likesRoommate,
      likesRoom: user.likesRoom,
    }));

    res.status(200).json(extractedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// get a User
export const getUser = async (req, res) => {

  const id = req.params.id;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);
  console.log(id);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  try {
    const user = await UserModel.findById(id);

    if (user) {
      const { password, ...userDetails } = user._doc;
      // Extract specific fields
      const { _id, firstname, lastname, gender, username, followers, following, likesRoommate, likesRoom } = userDetails;
      res.status(200).json({ _id, firstname, lastname, gender, username, followers, following, likesRoommate, likesRoom });
    } else {
      res.status(404).json("No such user exists");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// get personal details of a User
export const getPersonalUser = async (req, res) => {

  const id = req.params.id;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  try {
    const user = await UserModel.findById(id);
    if (user) {
      const userDetails = user._doc;
      delete userDetails.password;
      delete userDetails.emailToken;
      delete userDetails.__v;
      delete userDetails.createdAt;
      delete userDetails.updatedAt;
      delete userDetails.isVerified;
      res.status(200).json(userDetails);
    } else {
      res.status(404).json("No such user exists");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// update a user by admin
export const updateUserByAdmin = async (req, res) => {
  try {
    // Extract necessary information from the request
    const { adminUsername, adminPassword } = req.body;
    const username = req.params.username;

    // Verify admin credentials
    const isValidAdmin = await verifyAdminCredentials(adminUsername, adminPassword);

    if (!isValidAdmin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // If admin credentials are valid, proceed to update user
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user with the provided data from req.body
    const updatedFields = { ...req.body };
    delete updatedFields.adminUsername;
    delete updatedFields.adminPassword;

    const updatedUser = await UserModel.findOneAndUpdate({ username }, updatedFields, {
      new: true,
    });

    if (updatedUser) {
      return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } else {
      return res.status(500).json({ message: 'Error updating user' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Helper function to verify admin credentials
const verifyAdminCredentials = async (adminUsername, adminPassword) => {
  try {
    // Verify Admin credentials
    const adminUser = await UserModel.findOne({ username: adminUsername, isAdmin: true });

    if (!adminUser) {
      return false;
    }

    const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.password);
    return isPasswordValid;
  } catch (error) {
    throw error;
  }
};

// update a user from client side
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId } = req.body;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  try {
    // Retrieve the user from the database
    const user = await UserModel.findById(id);


    // Compare currentUserId with the retrieved user's id
    if (id === currentUserId) {


      // Define the allowed fields
      const allowedFields = ['firstname', 'lastname', 'gender', 'regnum', 'mobile', 'isProfileComplete'];

      // Extract only the allowed fields from the request body
      const updatedFields = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updatedFields[field] = req.body[field];
        }
      });

      // Update the gender field only if it is currently null
      if (user.gender === '' || user.gender === null) {
        updatedFields['gender'] = req.body['gender'];
      } else {
        delete updatedFields.gender;
      }

      // Update the user's profile
      const updatedUser = await UserModel.findByIdAndUpdate(id, updatedFields, {
        new: true,
      });
      // Remove sensitive information
      if (updatedUser) {
        const token = jwt.sign(
          { username: updatedUser.username, id: updatedUser._id },
          process.env.JWTKEY
        );
        const userDetails = updatedUser._doc;
        delete userDetails.password;
        delete userDetails.emailToken;
        delete userDetails.__v;
        delete userDetails.createdAt;
        delete userDetails.updatedAt;
        delete userDetails.isVerified;
        res.status(200).json({ user: userDetails, token });
      }

    } else {
      res.status(403).json("Access Denied! You can only update your own profile");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { currentUserId, currentUserAdminStatus } = req.body;

  if (currentUserId === id || currentUserAdminStatus) {
    try {
      await UserModel.findByIdAndDelete(id);
      res.status(200).json("User deleted successfully");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied! you can only delete your own profile");
  }
};

// Follow a User
export const followUser = async (req, res) => {
  const id = req.params.id;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json("Action forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      try {
        const user = await UserModel.findById(currentUserId);

        if (user) {
          if (!followUser.followers.includes(currentUserId)) {
            await followUser.updateOne({ $push: { followers: currentUserId } });
            await followingUser.updateOne({ $push: { following: id } });
            res.status(200).json("User followed!");
          } else {
            res.status(403).json("User is Already followed by you");
          }
        }
        else {
          res.status(404).json("No such user exists that you are trying to follow.");
        }
      } catch (error) {
        res.status(500).json(error);
      }

    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// UnFollow a User
export const UnFollowUser = async (req, res) => {
  const id = req.params.id;

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json("Action forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);


      try {
        const user = await UserModel.findById(currentUserId);

        if (user) {
          if (followUser.followers.includes(currentUserId)) {
            await followUser.updateOne({ $pull: { followers: currentUserId } });
            await followingUser.updateOne({ $pull: { following: id } });
            res.status(200).json("User Unfollowed!");
          } else {
            res.status(403).json("User is not followed by you");
          }
        }
        else {
          res.status(404).json("No such user exists that you are trying to unfollow.");
        }
      } catch (error) {
        res.status(500).json(error);
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// follow/unfollow - like/unlike a room (trying 2nd method - smaller version).
export const likeRoom = async (req, res) => {
  

  // Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { roomId,currentUserId } = req.body;
  console.log(currentUserId,roomId);
  

  try {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({ message: "Invalid Room ID format" });
    }
    const roomExists = await needRoomModel.findById(roomId);
    console.log(roomId);
    if(!roomExists){
      return res.status(403).json("Room Not Found");
    }
    const user = await UserModel.findById(currentUserId);
    if (!user.likesRoom.includes(roomId)) {
      await user.updateOne({ $push: { likesRoom: roomId } });
      res.status(200).json("Room liked");
    } else {
      await user.updateOne({ $pull: { likesRoom: roomId } });
      res.status(200).json("Room Unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// like/unlike a roommate
export const likeRoommate = async (req, res) => {
  

  // Check if the request has an 'Origin' header// Check if the request has an 'Origin' header
  const url = req.get('Origin');
  console.log('Domain:', url);

  if (process.env.NODE_ENV === "production" && url !== process.env.CLIENT_URL) {
    res.status(403).json({ message: `${process.env.ACCESS_FORBIDDEN_MSG}` });
    return;
  }

  const { currentUserId,roommateId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(roommateId)) {
    return res.status(400).json({ message: "Invalid Roommate ID format" });
    }
    const roommateExists = await needRoommateModel.findById(roommateId);
    console.log(roommateId);
    if(!roommateExists){
      return res.status(403).json("Roommate Not Found");
    }

    const user = await UserModel.findById(currentUserId);
    if (!user.likesRoommate.includes(roommateId)) {
      await user.updateOne({ $push: { likesRoommate: roommateId } });
      res.status(200).json("Roommate liked");
    } else {
      await user.updateOne({ $pull: { likesRoommate: roommateId } });
      res.status(200).json("Roommate Unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};