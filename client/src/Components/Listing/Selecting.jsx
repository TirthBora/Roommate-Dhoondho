import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { ListingContext } from "../../Context/listing-context.jsx";
import { useChat } from "../../Context/chat-context";
import ChatWindow from "../Chat/ChatWindow";
import "../Cards/Cards.css";
import "./Selecting.css";
import Modal from "../../Components/Modal/Modal";
import Modal2 from "../Modal/Modal2";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";

import Hotjar from '@hotjar/browser';
const siteId = 3765543;
const hotjarVersion = 6;
Hotjar.init(siteId, hotjarVersion);

export const Listing = () => {
  const {
    showModal,
    showModal2,
    selectRoommateDetail,
    selectRoomDetail,
    selectRoommatePhone,
    selectRoommateEmail,
    selectRoomPhone,
    selectRoomEmail,
  } = useContext(ListingContext);

  const { activeChats, startChat, closeChat } = useChat();
  const profileData = JSON.parse(secureLocalStorage.getItem("profile"));
  const navigate = useNavigate();
  
  const [roommatePosts, setRoommatePosts] = useState([]);
  const [roomPosts, setRoomPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profileData) {
      toast.error('Session expired. Please Sign In again.');
      navigate("/");
    }
  }, [profileData, navigate]);

  const fetchLikedItems = async () => {
    try {
      setIsLoading(true);
      const userId = profileData?.user?._id || profileData?.id;
      
      const userRes = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/user/${userId}`
      );
      
      const likedRoommateIds = userRes.data.likesRoommate || [];
      const likedRoomIds = userRes.data.likesRoom || [];

      const roommatePromises = likedRoommateIds.map(id => 
        axios.get(`${process.env.REACT_APP_SERVER_URL}/roommate/${id}`)
      );

      const roomPromises = likedRoomIds.map(id => 
        axios.get(`${process.env.REACT_APP_SERVER_URL}/room/${id}`)
      );

      const [roommateResults, roomResults] = await Promise.all([
        Promise.allSettled(roommatePromises),
        Promise.allSettled(roomPromises)
      ]);

      setRoommatePosts(roommateResults.filter(res => res.status === 'fulfilled').map(res => res.value.data));
      setRoomPosts(roomResults.filter(res => res.status === 'fulfilled').map(res => res.value.data));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching selections:", error);
      toast.error("Failed to load your selections");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profileData) fetchLikedItems();
  }, []);

  // --- HANDLERS FOR UNLIKING (Removing from Selections) ---
const handleUnlikeRoommate = async (roommateId) => {
    try {
      const currentUserId = profileData?.user?._id || profileData?.id; // Renamed to match backend
      await axios.put(`${process.env.REACT_APP_SERVER_URL}/user/likesroommate`, {
        currentUserId, // Changed key from userId to currentUserId
        roommateId
      });
      toast.success("Removed from selections");
      setRoommatePosts(prev => prev.filter(item => (item?._id || item?.id) !== roommateId));
    } catch (error) {
      toast.error("Failed to remove roommate");
    }
  };

  const handleUnlikeRoom = async (roomId) => {
    try {
      const currentUserId = profileData?.user?._id || profileData?.id; // Renamed to match backend
      await axios.put(`${process.env.REACT_APP_SERVER_URL}/user/likesroom`, {
        currentUserId, // Changed key from userId to currentUserId
        roomId
      });
      toast.success("Removed from selections");
      setRoomPosts(prev => prev.filter(item => (item?._id || item?.id) !== roomId));
    } catch (error) {
      toast.error("Failed to remove room");
    }
  };

  const handleStartChat = async (roommate) => {
    const chat = await startChat({
      _id: roommate._id,
      firstname: roommate.firstname,
      lastname: roommate.lastname,
    });
    if (chat) toast.success("Chat started!");
  };

  return (
    <div className="listing">
      <div className="listing-buttons">
        <button className="activelisting">
          <p className="listing-text">Your Selections</p>
        </button>
      </div>
      <div className="profiletab-hr"><hr /></div>

      <div className="tab-content">
        {isLoading ? (
          <div className="loading-indicator-container">
            <CircularProgress disableShrink color="primary" size={40} />
          </div>
        ) : (
          <div>
            {showModal && <Modal />}
            {showModal2 && <Modal2 />}

            {/* --- ROOMMATES SECTION --- */}
            <h3 className="selection-heading">Liked Roommates</h3>
            <div className="cards">
              {roommatePosts.length > 0 ? roommatePosts.map((item) => (
                <div className="each-card" key={item?._id}>
                  <div className="main-card">
                    <div className="card-details">
                      <div className="card-img" style={{ backgroundImage: `url('https://static01.nyt.com/images/2020/04/19/magazine/19Ethicist/19Ethicist-jumbo.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      <div className="card-info">
                        <div className="card-informatios">
                          <div className="card-name">Roommate Posting</div>
                          <div className="card-actions">
                            <button className="chat-button" onClick={() => handleStartChat(item)}>Chat</button>
                            {/* RE-ADDED MINUS BUTTON FOR UNLIKING */}
                            <div className="card-add" onClick={() => handleUnlikeRoommate(item?._id)}>
                              <img src="./image/minus-icon.png" alt="remove" style={{ height: "24px", width: "24px" }} />
                            </div>
                          </div>
                        </div>
                        <div className="card-preference">
                          <div className="card-rank">
                            <div className="card-preference-title">Rank</div>
                            <div className="card-preference-content">{item?.rank}</div>
                          </div>
                          <div className="card-bed">
                            <div className="card-preference-title">Preferred Bed Type</div>
                            <div className="card-preference-content">{item?.preferredBed}</div>
                          </div>
                          <div className="card-bed">
                            <div className="card-preference-title">Vacancy</div>
                            <div className="card-preference-content">{item?.remaining}</div>
                          </div>
                        </div>
                        <div className="card-downers">
                          <div className="card-year">
                            <div className="card-preference-title">Year</div>
                            <div className="card-preference-Year">{item?.year}</div>
                          </div>
                          <div className="card-gender">
                            <div className="card-preference-title">Gender</div>
                            <div className="card-preference-Gender">{item?.gender}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-hr"><hr /></div>
                    <div className="card-habits-section">
                      <div className="card-habit">For Description - Click on the button</div>
                      <div className="card-habit-details" onClick={() => {
                        selectRoommateDetail(item?.desc);
                        selectRoommatePhone(item?.phone);
                        selectRoommateEmail(item?.username);
                      }}>
                        <img src="./image/desc.png" alt="desc" style={{ height: "18px", width: "18px" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )) : <p>No liked roommates yet.</p>}
            </div>

            {/* --- ROOMS SECTION --- */}
            <h3 className="selection-heading" style={{ marginTop: '40px' }}>Liked Rooms</h3>
            <div className="cards">
              {roomPosts.length > 0 ? roomPosts.map((room) => (
                <div className="each-card" key={room?._id}>
                  <div className="main-card">
                    <div className="card-details">
                      <div className="card-img" style={{ backgroundImage: `url('https://c4.wallpaperflare.com/wallpaper/40/849/87/anime-girls-wallpaper-preview.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      <div className="card-info">
                        <div className="card-informatios">
                          <div className="card-name">Rank: {room?.rank} - {room?.preferredBlock} Block Posting</div>
                          {/* RE-ADDED MINUS BUTTON FOR UNLIKING */}
                          <div className="card-add" onClick={() => handleUnlikeRoom(room?._id)}>
                            <img src="./image/minus-icon.png" alt="remove" style={{ height: "24px", width: "24px" }} />
                          </div>
                        </div>
                        <div className="card-preference">
                          <div className="card-rank">
                            <div className="card-preference-title">Rank</div>
                            <div className="card-preference-content">{room?.rank}</div>
                          </div>
                          <div className="card-bed">
                            <div className="card-preference-title">Preferred bed</div>
                            <div className="card-preference-content">{room?.preferredBed}</div>
                          </div>
                          <div className="card-block">
                            <div className="card-preference-title">Block</div>
                            <div className="card-preference-content">{room?.preferredBlock}</div>
                          </div>
                        </div>
                        <div className="card-downers2">
                          <div className="card-year">
                            <div className="card-preference-title">Year</div>
                            <div className="card-preference-Year">{room?.year}</div>
                          </div>
                          <div className="card-gender">
                            <div className="card-preference-title">Gender</div>
                            <div className="card-preference-Gender">{room?.gender}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-hr"><hr /></div>
                    <div className="card-habits-section">
                      <div className="card-habit">For Description - Click on the button</div>
                      <div className="card-habit-details" onClick={() => {
                        selectRoomDetail(room?.desc);
                        selectRoomPhone(room?.phone);
                        selectRoomEmail(room?.username);
                      }}>
                        <img src="./image/desc.png" alt="desc" style={{ height: "18px", width: "18px" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )) : <p>No liked rooms yet.</p>}
            </div>
          </div>
        )}
      </div>

      {activeChats.map((chat) => (
        <ChatWindow key={chat.id} chatId={chat.id} otherUser={chat.otherUser} onClose={() => closeChat(chat.id)} />
      ))}
    </div>
  );
};