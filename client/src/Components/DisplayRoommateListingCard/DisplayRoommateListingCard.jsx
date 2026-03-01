import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "../Cards/Cards.css";
import Modal from "../../Components/Modal/Modal";
import { ListingContext } from "../../Context/listing-context";
import { useChat } from "../../Context/chat-context";
import ChatWindow from "../Chat/ChatWindow";
import { toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";

function DisplayRoommateListingCard() {
  const { showModal, selectRoommateDetail, selectRoommatePhone, selectRoommateEmail } = useContext(ListingContext);
  const { activeChats, startChat, closeChat } = useChat();
  const profileData = JSON.parse(secureLocalStorage.getItem("profile"));
  const [roommates, setRoommates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user_Id = profileData?.user?._id || profileData?.id;

        const requestData = {
          userId: user_Id,
        };

        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/roommate/my/${user_Id}`,
          requestData
        );
        setRoommates(response.data);
      } catch (error) {
        console.error("Error fetching roommates:", error);
      }
    };

    fetchData();
  }, [profileData?.user?._id]);

  const deleteRoommate = async (roommate_id) => {
    try {
      const user_Id = profileData?.user?._id || profileData?.id;
      const requestBody = {
        userId: user_Id,
        roommateId: roommate_id,
      };

      await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/roommate/delete`,
        {
          data: requestBody,
        }
      );

      toast.success("Roommate deleted successfully!");
      setRoommates((prevRoommates) =>
        prevRoommates.filter((roommate) => (roommate?._id || roommate?.id) !== roommate_id)
      );
    } catch (error) {
      toast.error("Failed to delete roommate");
    }
  };

  const handleStartChat = async (roommate) => {
    const chat = await startChat({
      _id: roommate._id,
      firstname: roommate.firstname,
      lastname: roommate.lastname,
    });
    
    if (chat) {
      toast.success("Chat started successfully!");
    }
  };

  return (
    <>
      {showModal && <Modal />}
      {roommates.map((roommate) => (
        <div className="each-card" key={roommate?.id}>
          <span className="cards">
            <div className="main-card">
              <div className="card-details">
                <div
                  className="card-img"
                  style={{
                    backgroundImage: `url('https://static01.nyt.com/images/2020/04/19/magazine/19Ethicist/19Ethicist-jumbo.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
                <div className="card-info">
                  <div className="card-informatios">
                    <div className="card-name">Roommate Posting</div>
                    <div className="card-actions">
                      <button
                        className="chat-button"
                        onClick={() => handleStartChat(roommate)}
                      >
                        Chat
                      </button>
                      <div
                        className="card-add"
                        onClick={() => deleteRoommate(roommate?._id)}
                      >
                        <img
                          src="./image/minus-icon.png"
                          alt=""
                          style={{ height: "24px", width: "24px" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card-preference">
                    <div className="card-rank">
                      <div className="card-preference-title">Rank</div>
                      <div className="card-preference-content">
                        {roommate?.rank}
                      </div>
                    </div>
                    {/* <div className="card-block">
                      <div className="card-preference-title">
                        Preferred Block
                      </div>
                      <div className="card-preference-content">
                        {roommate?.preferredBlock}
                      </div>
                    </div> */}
                    <div className="card-bed">
                      <div className="card-preference-title">
                        Preferred Bed Type
                      </div>
                      <div className="card-preference-content">
                        {roommate?.preferredBed}
                      </div>
                    </div>
                    <div className="card-bed">
                      <div className="card-preference-title">Vacancy</div>
                      <div className="card-preference-content">
                        {roommate?.remaining}
                      </div>
                    </div>
                  </div>
                  <div className="card-downers">
                    <div className="card-year">
                      <div className="card-preference-title">Year</div>
                      <div className="card-preference-Year">
                        {roommate?.year}
                      </div>
                    </div>
                    <div className="card-gender">
                      <div className="card-preference-title">Gender</div>
                      <div className="card-preference-Gender">
                        {roommate?.gender}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-hr">
                <hr />
              </div>
              <div className="card-habits-section">
                <div className="card-habit">For Description - Click on the button</div>
                <div
                  className="card-habit-details"
                  onClick={() => {
                    selectRoommateDetail(roommate?.desc);
                    selectRoommatePhone(roommate?.phone);
                    selectRoommateEmail(roommate?.username);
                  }}
                >
                  <div>
                    <img
                      src="./image/desc.png"
                      alt=""
                      style={{ height: "18px", width: "18px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </span>
        </div>
      ))}
      {activeChats.map((chat) => (
        <ChatWindow
          key={chat.id}
          chatId={chat.id}
          otherUser={chat.otherUser}
          onClose={() => closeChat(chat.id)}
        />
      ))}
    </>
  );
}

export default DisplayRoommateListingCard;
