import React, { Component, useEffect, useState, useContext } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import "./paginationStyles.css";
import "../Cards/Cards.css";
import { ListingContext } from "../../Context/listing-context";
import Modal from "../../Components/Modal/Modal";
import Modal2 from "../Modal/Modal2";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import secureLocalStorage from "react-secure-storage";

import Hotjar from "@hotjar/browser";
const siteId = 3765543;
const hotjarVersion = 6;
Hotjar.init(siteId, hotjarVersion);
const homePage = "/home";
Hotjar.stateChange(homePage);

function DisplayRoommateCard() {
  const resetTabContent = () => {
    // Reset the page state to 1 when changing tabs
    setPage(1);
    setResetPaginationKey((prevKey) => prevKey + 1);
  };
  console.log(secureLocalStorage.getItem("profile"))
  const profileData = JSON.parse(secureLocalStorage.getItem("profile"));
  //console.log(profileData)
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const user = useSelector((state) => state.authReducer.authData);
  const [roommatePosts, setRoommatePosts] = useState([]);
  const [roomPosts, setRoomPosts] = useState([]);
  const [roomLengthPosts, setroomLengthPosts] = useState([]);
  const [roommateLengthPosts, setroommateLengthPosts] = useState([]);
  const [filteredRoommatePosts, setFilteredRoommatePosts] = useState([]);
  const [filteredRoomPosts, setFilteredRoomPosts] = useState([]);
  const [userGender, setUserGender] = useState([]);
  const [userId, setUserId] = useState([]);
  const [following, setFollowing] = useState([]);
  const [likeRoom, setLikeRoom] = useState([]);
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedBlock, setSelectedBlock] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [rankOrder, setSelectedRankOrder] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPagesroommate, setTotalPagesroommate] = useState(1);
  const [resetPaginationKey, setResetPaginationKey] = useState(1);
  const resetPagination = () => {
    setResetPaginationKey((prevKey) => prevKey + 1);
  };
  const perPage = 9; // No of items to be displayed in a page

  Hotjar.identify(profileData?.user?.username, {
    first_name: profileData?.user?.firstname,
    last_name: profileData?.user?.lastname,
    gender: profileData?.user?.gender,
  });

  useEffect(() => {
    if (!profileData) {
      console.error("Error accessing user profileData");
      toast.error("Error L1075A. Please Sign In again.");
      navigate("/");
    }
  }, [profileData, navigate]);

  let userGenderAll;
  try {
    userGenderAll = profileData?.user?.gender;
  } catch (error) {
    console.error("Error accessing user gender:", error);
  }

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const {
    addToCart2,
    addToCart,
    showModal,
    showModal2,
    selectRoommateDetail,
    seletedroommatedetail,
    selectRoomDetail,
    selectRoommatePhone,
    seletedroomdetail,
    selectRoommateEmail,
    selectRoomPhone,
    selectRoomEmail,
  } = useContext(ListingContext);
  const getBlockOptions = (userGender) => {
    const menHostels = [
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
      "All",
    ];
    const womenHostels = ["A", "B", "C", "D", "E", "F", "G", "H", "All"];
    if (userGender === "F") {
      return womenHostels;
    } else {
      return menHostels;
    }
  };

  useEffect(() => {
    const fetchRoommateAndRoomCards = async () => {
      try {
        
        const roomLengthResponse = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/room/all?gender=${userGenderAll}&year=${selectedYear}&preferredBlock=${selectedBlock}&sort=${rankOrder}`
        );
        const roomLengthPosts = roomLengthResponse.data;

        const roommateLengthResponse = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/roommate/all?gender=${userGenderAll}&year=${selectedYear}&preferredBlock=${selectedBlock}&sort=${rankOrder}`
        );
        const roommateLengthPosts = roommateLengthResponse.data;

        console.log(roommateLengthPosts);
        // Fetch roommate posts in batches
        const roommateResponse = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/roommate/all?page=${page}&limit=${perPage}&gender=${userGenderAll}&year=${selectedYear}&preferredBlock=${selectedBlock}&sort=${rankOrder}`
        );
        const roommatePosts = roommateResponse.data;

        // Fetch room posts in batches
        const roomResponse = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/room/all?page=${page}&limit=${perPage}&gender=${userGenderAll}&year=${selectedYear}&preferredBlock=${selectedBlock}&sort=${rankOrder}`
        );
        const roomPosts = roomResponse.data;

        const roommatePostsWithUserDetailsPromises = roommatePosts
          .map((post) => {
            return axios
              .get(`${process.env.REACT_APP_SERVER_URL}/user/${post?.userId}`)
              .then((userResponse) => {
                const userDetails = userResponse.data;
                return {
                  ...post,
                  userDetails,
                };
              })
              .catch((error) => {
                console.log(
                  `Error fetching user details for user ID ${post?.userId}:`,
                  error
                );
                return null;
              });
          })
          .filter((post) => post !== null); // Filter out null values

        const roomPostsWithUserDetailsPromises = roomPosts
          .map((post) => {
            return axios
              .get(`${process.env.REACT_APP_SERVER_URL}/user/${post?.userId}`)
              .then((userResponse) => {
                const userDetails = userResponse.data;
                return {
                  ...post,
                  userDetails,
                };
              })
              .catch((error) => {
                console.log(
                  `Error fetching user details for user ID ${post?.userId}:`,
                  error
                );
                return null;
              });
          })
          .filter((post) => post !== null); // Filter out null values

        const [roommatePostsWithUserDetails, roomPostsWithUserDetails] =
          await Promise.all([
            Promise.all(roommatePostsWithUserDetailsPromises),
            Promise.all(roomPostsWithUserDetailsPromises),
          ]);

        setRoommatePosts(roommatePostsWithUserDetails);
        setRoomPosts(roomPostsWithUserDetails);

        setroomLengthPosts(roomLengthPosts);
        setroommateLengthPosts(roommateLengthPosts);
        setIsLoading(false);
        setTotalPages(Math.ceil(roomLengthPosts.length / perPage));
        setTotalPagesroommate(Math.ceil(roommateLengthPosts.length / perPage));
        console.log(totalPages);
        console.log("current:", page);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false); // Set loading back to false when all posts are fetched
      }
    };

    if (profileData?.user?.gender) {
      fetchFollowing();
      fetchRoommateAndRoomCards();
    } else {
      setIsLoading(false);
      setShowPlaceholder(true);
    }
  }, [page, selectedBlock, selectedYear, rankOrder]);

  const fetchFollowing = () => {
    console.log(profileData?.user?._id)
    return axios
      .get(`${process.env.REACT_APP_SERVER_URL}/user/${profileData?.user?._id}`)
      .then((response) => {
        console.log("Profile fetched:", response.data);
        const followingUserIds = response.data.likesRoommate;
        const likeRoomIds = response.data.likesRoom;
        const userGender = response.data.gender;
        const userId = response.data._id;
        setFollowing(followingUserIds);
        setLikeRoom(likeRoomIds);
        setUserGender(userGender);
        setUserId(userId);
        console.log(
          "Following fetched:",
          followingUserIds,
          likeRoomIds,
          userGender
        );
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        return null;
      });
  };
  const blockOptions = getBlockOptions(userGender);

  const filterByGenderAndBlock = (gender, block, year, rankOrder) => {
    setSelectedGender(gender);
    setSelectedBlock(block);
    setSelectedYear(year);
    setSelectedRankOrder(rankOrder);
    resetPagination();
    setPage(1);
    console.log("current:", page);
  };

  async function likeRoommate(otherUserId) {
    try {
      const usersResponse = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/roommate/all`
      );

      const otherUserData = usersResponse.data.find(
        (user) => user._id === otherUserId
      );

      if (otherUserData) {
        const otherUserGender = otherUserData.gender;
        const roommateuserId = otherUserData.userId;
        // console.log(otherUserGender);
        if (roommateuserId !== userId) {
          if (
            (userGender === "M" && otherUserGender === "M") ||
            (userGender === "F" && otherUserGender === "F")
          ) {
            let myUserId = profileData?.id;
            let requestBody = {
              roommateId: otherUserId,
              currentUserId: userId
            };

            let result = await axios
              .put(
                `${process.env.REACT_APP_SERVER_URL}/user/likesRoommate`,
                requestBody
              )
              .catch((error) => {
                // Handle 404 errors here, you can simply ignore the error and return null or any other default value.
                console.log(
                  `Error fetching user details for user ID ${myUserId}:`,
                  error
                );
                return null;
              });

            // console.log("result: ", result);

            if (result.status === 200) {
              // Update the check-icon immediately
              toast.success(result.data);
              const updatedFollowing = [...following];
              if (!updatedFollowing.includes(otherUserId)) {
                updatedFollowing.push(otherUserId);
                setFollowing(updatedFollowing);
              }
            }
          } else {
            toast.error("Error Code: NT03GM. Please contact MFC support.");
            // alert("Broo.. In VIT we don't have coed hostels.");
          }
        } else {
          toast.error("You can't select your own post.");
          // alert("You can't select your own post.");
        }
      }
    } catch (error) {
      toast.error("Error Code: NT04GM. Please contact MFC support.");
      console.error(error);
    }
  }

async function RoomLiking(otherRoomId) {
  try {
    const roomResponse = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/room/all`
    );

    const roomDataResponse = roomResponse.data.find(
      (room) => room._id === otherRoomId
    );

    if (roomDataResponse) {
      const roomGender = roomDataResponse.gender;
      const roomuserId = roomDataResponse.userId;

      if (roomuserId !== userId) {
        if (
          (userGender === "M" && roomGender === "M") ||
          (userGender === "F" && roomGender === "F")
        ) {
          let requestBody = {
            roomId: otherRoomId,
            currentUserId: userId
          };

          let result = await axios
            .put(
              `${process.env.REACT_APP_SERVER_URL}/user/likesroom`,
              requestBody
            )
            .catch((error) => {
              console.log(
                `Error updating likes for user ID ${userId}:`,
                error
              );
              return null;
            });

          if (result && result.status === 200) {
            toast.success(result.data);
            const updatedLikeRoom = [...likeRoom];
            if (!updatedLikeRoom.includes(otherRoomId)) {
              updatedLikeRoom.push(otherRoomId);
              setLikeRoom(updatedLikeRoom);
            }
          }
        } else {
          toast.error("Error Code: NT05GM. Please contact MFC support.");
        }
      } else {
        toast.error("You can't select your own post.");
      }
    }
  } catch (error) {
    toast.error("Error Code: NT06GM. Please contact MFC support.");
    console.error(error);
  }
}
  return (
    <>
      <div className="tabs">
        <Tabs
          filterByGenderAndBlock={filterByGenderAndBlock}
          selectedGender={selectedGender}
          selectedBlock={selectedBlock}
          selectedYear={selectedYear}
          rankOrder={rankOrder}
          blockOptions={blockOptions}
          resetTabContent={resetTabContent} // Reseting the resetPagination function when changing tabs
        >
          <Tab label="Tab 1">
            {showModal && <Modal />}
            <div className="cards">
              {isLoading ? (
                <div className="loading-indicator-container">
                  <CircularProgress disableShrink color="primary" size={40} />
                </div>
              ) : showPlaceholder ? (
                <div align="center">
                  <Alert severity="warning">
                    Please complete your profile before using this application.
                    If you have already completed the profile and still see this
                    message, please goto your profile and click on "Submit"
                    button again.
                  </Alert>
                  <br />
                  <p>
                    If you face any problem, please report to us at
                    <br />
                    support@mozillavit.in
                    <br />
                    <br />
                    <button
                      onClick={handleGoToProfile}
                      className="bg-[#140922] px-4 py-2 text-white rounded-md"
                    >
                      Profile
                    </button>
                    <br />
                    <br />
                  </p>
                </div>
              ) : (
                roommatePosts.map((post) =>
                (
                    <div className="each-card" key={post?.id}>
                      <span className="cards">
                        <div className="main-card">
                          <div className="card-details">
                            <div
                              className="card-img"
                              style={{
                                backgroundImage: `url('https://static01.nyt.com/images/2020/04/19/magazine/19Ethicist/19Ethicist-jumbo.jpg')`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                // width: '132px',
                                // height: '158px',
                              }}
                            ></div>
                            <div className="card-info">
                              <div className="card-informatios">
                                <div className="card-name">
                                  {post?.userDetails.firstname ?? "Arjun"}{" "}
                                  {post?.userDetails.lastname ?? "Sharma"}
                                </div>
                                {userGender && (
                                  <div
                                    className="card-add"
                                    onClick={() =>
                                      likeRoommate(post?._id, post?.gender)
                                    }
                                  >
                                    {following.includes(post?._id) ? (
                                      <img
                                        src="./image/checkbox.png"
                                        alt=""
                                        style={{
                                          height: "24px",
                                          width: "24px",
                                        }}
                                      />
                                    ) : (
                                      <img
                                        src="./image/add-icon.png"
                                        alt=""
                                        style={{
                                          height: "24px",
                                          width: "24px",
                                        }}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="card-preference">
                                <div className="card-rank">
                                  <div className="card-preference-title">
                                    Rank
                                  </div>
                                  <div className="card-preference-content">
                                    {post?.rank}
                                  </div>
                                </div>
                                {/* <div className="card-block">
                                  <div className="card-preference-title">
                                    Preferred Block
                                  </div>
                                  <div className="card-preference-content">
                                    {post?.preferredBlock}
                                  </div>
                                </div> */}
                                <div className="card-bed">
                                  <div className="card-preference-title">
                                    Preferred Bed Type
                                  </div>
                                  <div className="card-preference-content">
                                    {post?.preferredBed}
                                  </div>
                                </div>
                                <div className="card-bed">
                                  <div className="card-preference-title">
                                    Vacancy
                                  </div>
                                  <div className="card-preference-content">
                                    {post?.remaining}
                                  </div>
                                </div>
                              </div>
                              <div className="card-downers">
                                <div className="card-year">
                                  <div className="card-preference-title">
                                    Year
                                  </div>
                                  <div className="card-preference-Year">
                                    {post?.year}
                                  </div>
                                </div>
                                <div className="card-gender">
                                  <div className="card-preference-title">
                                    Gender
                                  </div>
                                  <div className="card-preference-Gender">
                                    {post?.gender}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="card-hr">
                            <hr />
                          </div>
                          <div className="card-habits-section">
                            <div className="card-habit">
                              For Description - Click on the button
                            </div>
                            <div
                              className="card-habit-details"
                              onClick={() => {
                                selectRoommateDetail(post?.desc);
                                selectRoommatePhone(post?.phone);
                                selectRoommateEmail(post?.username);
                              }}
                            >
                              <div className="detail-box">
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
                  )
                )
              )}
            </div>
            <div
              style={{
                justifyContent: "center",
                boxSizing: "border-box",
                width: "100%",
                height: "100%",
              }}
            >
              {isLoading && (
                <div className="loading-indicator-container">
                  <CircularProgress disableShrink color="primary" size={40} />
                </div>
              )}
              <ReactPaginate
                activeClassName="active-pagination-button bg-purple text-blue"
                key={resetPaginationKey}
                pageCount={totalPagesroommate}
                pageRangeDisplayed={5}
                marginPagesDisplayed={2}
                onPageChange={async (selected) => {
                  try {
                    // Set loading to true when pagination changes
                    setIsLoading(true);

                    // Update the current page
                    console.log("Page changed to:", selected.selected + 1);
                    setPage(selected.selected + 1);
                  } catch (error) {
                    console.error("Error fetching data:", error);
                  } finally {
                    // Set loading back to false when data has been fetched (whether successful or not)
                    setIsLoading(false);
                  }
                }}
                containerClassName="flex items-center justify-center mt-8 mb-4"
                nextLabel={
                  <span className="w-10 h-10 flex items-center justify-center bg-lightGray rounded-md">
                    <BsChevronRight />
                  </span>
                }
                breakLabel={<span className="mr-4">...</span>}
                pageClassName="block border- border-solid border-lightGray hover:bg-lightGray w-10 h-10 flex items-center justify-center rounded-md mr-4"
                previousLabel={
                  <span className="w-10 h-10 flex items-center justify-center bg-lightGray rounded-md mr-4">
                    <BsChevronLeft />
                  </span>
                }
              />
            </div>
          </Tab>
          <Tab label="Tab 2">
            {showModal2 && <Modal2 />}
            <div className="cards">
              {isLoading ? (
                <div className="loading-indicator-container">
                  <CircularProgress disableShrink color="primary" size={40} />
                </div>
              ) : showPlaceholder ? (
                <div align="center">
                  <Alert severity="warning">
                    Please complete your profile before using this application.
                    If you have already completed the profile and still see this
                    message, please goto your profile and click on "Submit"
                    button again.
                  </Alert>
                  <br />
                  <p>
                    If you face any problem, please report to us at
                    <br />
                    support@mozillavit.in
                    <br />
                    <br />
                    <button
                      onClick={handleGoToProfile}
                      className="bg-[#140922] px-4 py-2 text-white rounded-md"
                    >
                      Profile
                    </button>
                    <br />
                    <br />
                  </p>
                </div>
              ) : (
                roomPosts.map((post) => (
                  <div div className="each-card" key={post?.id}>
                    <span className="cards">
                      <div className="main-card">
                        <div className="card-details">
                          <div
                            className="card-img"
                            style={{
                              backgroundImage: `url('https://c4.wallpaperflare.com/wallpaper/40/849/87/anime-girls-wallpaper-preview.jpg')`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              // width: '132px',
                              // height: '158px',
                            }}
                          ></div>
                          <div className="card-info">
                            <div className="card-informatios">
                              <div className="card-name">
                              Rank: {post?.rank} - {post?.preferredBlock} Block
                              </div>
                              <div
                                className="card-add"
                                onClick={() =>
                                  RoomLiking(post?._id, post?.gender)
                                }
                              >
                                {likeRoom.includes(post?._id) ? (
                                  <img
                                    src="./image/checkbox.png"
                                    alt=""
                                    style={{ height: "24px", width: "24px" }}
                                  />
                                ) : (
                                  <img
                                    src="./image/add-icon.png"
                                    alt=""
                                    style={{ height: "24px", width: "24px" }}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="card-preference">
                              <div className="card-rank">
                                <div className="card-preference-title">
                                  Rank
                                </div>
                                <div className="card-preference-content">
                                  {post?.rank}
                                </div>
                              </div>
                              <div className="card-block">
                                <div className="card-preference-title">
                                Preferred Bed
                                </div>
                                <div className="card-preference-content">
                                  {post?.preferredBed}
                                </div>
                              </div>
                              <div className="card-bed">
                                <div className="card-preference-title">
                                  Block
                                </div>
                                <div className="card-preference-content">
                                  {post?.preferredBlock}
                                </div>
                              </div>
                            </div>
                            <div className="card-downers2">
                              <div className="card-year">
                                <div className="card-preference-title">
                                  Year
                                </div>
                                <div className="card-preference-Year">
                                  {post?.year}
                                </div>
                              </div>
                              <div className="card-gender">
                                <div className="card-preference-title">
                                  Gender
                                </div>
                                <div className="card-preference-Gender">
                                  {post?.gender}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card-hr">
                          <hr />
                        </div>
                        <div className="card-habits-section">
                          <div className="card-habit">
                            For Description - Click on the button
                          </div>
                          <div
                            className="card-habit-details"
                            onClick={() => {
                              selectRoomDetail(post?.desc);
                              selectRoomPhone(post?.phone);
                              selectRoomEmail(post?.username);
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
                ))
              )}
            </div>
            <div
              style={{
                justifyContent: "center",
                boxSizing: "border-box",
                width: "100%",
                height: "100%",
              }}
            >
              {isLoading && (
                <div className="loading-indicator-container">
                  <CircularProgress disableShrink color="primary" size={40} />
                </div>
              )}
              <ReactPaginate
                activeClassName="active-pagination-button bg-purple text-blue"
                key={resetPaginationKey}
                pageCount={totalPages}
                pageRangeDisplayed={5}
                marginPagesDisplayed={2}
                onPageChange={async (selected) => {
                  try {
                    // Set loading to true when pagination changes
                    setIsLoading(true);

                    // Update the current page
                    console.log("Page changed to:", selected.selected + 1);
                    setPage(selected.selected + 1);
                  } catch (error) {
                    console.error("Error fetching data:", error);
                  } finally {
                    // Set loading back to false when data has been fetched (whether successful or not)
                    setIsLoading(false);
                  }
                }}
                containerClassName="flex items-center justify-center mt-8 mb-4"
                nextLabel={
                  <span className="w-10 h-10 flex items-center justify-center bg-lightGray rounded-md">
                    <BsChevronRight />
                  </span>
                }
                breakLabel={<span className="mr-4">...</span>}
                pageClassName="block border- border-solid border-lightGray hover:bg-lightGray w-10 h-10 flex items-center justify-center rounded-md mr-4"
                previousLabel={
                  <span className="w-10 h-10 flex items-center justify-center bg-lightGray rounded-md mr-4">
                    <BsChevronLeft />
                  </span>
                }
              />
            </div>
          </Tab>
        </Tabs>
      </div>
    </>
  );
}

class Tabs extends Component {
  state = {
    activeTab: this.props.children[0].props.label,
  };

  changeTab = (tab) => {
    this.setState({ activeTab: tab });
    this.props.resetTabContent(); // Call the resetPagination function when changing tabs
  };
  render() {
    let content;
    let buttons = [];
    const { gender_sorting } = this.props;
    const { filterByGenderAndBlock } = this.props;
    const { selectedGender } = this.props;
    const { rankOrder } = this.props;
    const { selectedBlock } = this.props;
    const { selectedYear } = this.props;
    const { blockOptions } = this.props;

    return (
      <div>
        {React.Children.map(this.props.children, (child) => {
          buttons.push(child.props.label);
          if (child.props.label === this.state.activeTab)
            content = child.props.children;
        })}

        <TabButtons
          activeTab={this.state.activeTab}
          buttons={buttons}
          changeTab={this.changeTab}
          genderSorting={gender_sorting}
          filterByGenderAndBlock={filterByGenderAndBlock}
          selectedGender={selectedGender}
          rankOrder={rankOrder}
          selectedBlock={selectedBlock}
          selectedYear={selectedYear}
          blockOptions={blockOptions}
        />
        <div className="tab-content">{content}</div>
      </div>
    );
  }
}

const TabButtons = ({
  buttons,
  changeTab,
  activeTab,
  selectedGender,
  selectedBlock,
  selectedYear,
  rankOrder,
  filterByGenderAndBlock,
  blockOptions,
}) => {
  return (
    <div className="navtab-main">
      <div className="tab-buttons">
        {buttons.map((button) => {
          return (
            <button
              className={button === activeTab ? "active" : "nonactive"}
              onClick={() => changeTab(button)}
            >
              {button === activeTab ? (
                <React.Fragment>
                  {button === "Tab 1" ? (
                    <span className="tab-elements">
                      <div className="roomate-icon">
                        <img src="./image/roommatesicon.png" alt="" />
                        <div className="tab-text">Need Roommate</div>
                      </div>
                    </span>
                  ) : (
                    <span className="tab-elements">
                      <div className="roomate-icon">
                        <img src="./image/bed2.png" alt="" />
                        <div className="tab-text">Need Room</div>
                      </div>
                    </span>
                  )}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {button === "Tab 1" ? (
                    <span className="tab-elements">
                      <div className="roomate-icon">
                        <img src="./image/roommatesicon2.png" alt="" />
                      </div>
                      <div className="tab-text">Need Roommate</div>
                    </span>
                  ) : (
                    <span className="tab-elements">
                      <div className="roomate-icon">
                        <img src="./image/bed.png" alt="" />
                      </div>
                      <div className="tab-text">Need Room</div>
                    </span>
                  )}
                </React.Fragment>
              )}
            </button>
          );
        })}
        <div className="tab-dropdownbuttons">
          <div className="custom-select">
            <select
              onChange={(e) =>
                filterByGenderAndBlock(
                  selectedGender,
                  selectedBlock,
                  selectedYear,
                  e.target.value
                )
              }
            >
              <option hidden value="createdAt">
                Rank
              </option>
              <option value="rank,asc">Increasing</option>
              <option value="rank,desc">Decreasing</option>
            </select>
          </div>
          <div className="custom-select">
            <select
              onChange={(e) =>
                filterByGenderAndBlock(
                  selectedGender,
                  selectedBlock,
                  e.target.value,
                  rankOrder
                )
              }
            >
              <option hidden value="Year">
                Year
              </option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="All">All</option>
            </select>
          </div>
          <div className="custom-select">
            <select
              onChange={(e) =>
                filterByGenderAndBlock(
                  selectedGender,
                  e.target.value,
                  selectedYear,
                  rankOrder
                )
              }
            >
              <option hidden value="Block">
                Block
              </option>
              {blockOptions.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>
          {/* <div className="custom-select-2">
            <select
              onChange={(e) =>
                filterByGenderAndBlock(
                  e.target.value,
                  selectedBlock,
                  selectedYear
                )
              }
            >
              <option hidden value="Gender">
                Gender
              </option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="All">All</option>
            </select>
          </div> */}
        </div>
      </div>
      <div className="navtab-hr">
        <hr />
      </div>
    </div>
  );
};

const Tab = (props) => {
  return <React.Fragment>{props.children}</React.Fragment>;
};

export default DisplayRoommateCard;
