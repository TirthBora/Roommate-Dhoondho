import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import Navbar from "../NavBar/Navbar";
import Footer from "../Footer/Footer";
import DisplayRoommateListingCard from "../DisplayRoommateListingCard/DisplayRoommateListingCard";
import DisplayRoomListingCard from "../DisplayRoomListingCard/DisplayRoomListingCard";

import boy from "../../Assets/profile-page/profile-boy.png";

import "./MyProfile.css";

const Profilepage = () => {
  const navigate = useNavigate();
  const profileData = JSON.parse(secureLocalStorage.getItem("profile"));

  const [fields, setFields] = useState({
    firstname: "",
    lastname: "",
    regnum: "",
    gender: "",
    mobileno: "",
    emailid: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [formEvent, setFormEvent] = useState(null);
  const [serverMessage, setServerMessage] = useState(null);

  const isGenderEditable =
    !profileData?.user?.gender ||
    profileData.user.gender === "" ||
    profileData.user.gender === null;

  /* ---------------- AUTH CHECK ---------------- */

  useEffect(() => {
    if (!profileData) {
      toast.error("Please login again.");
      navigate("/");
    }
  }, [profileData, navigate]);

  /* ---------------- FETCH PROFILE ---------------- */

  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_SERVER_URL}/user/personal/${profileData?.id || profileData?.user?._id
        }`,
        {
          headers: {
            x_authorization: `Bearer ${JSON.parse(
              secureLocalStorage.getItem("auth_token")
            )}`,
          },
        }
      )
      .then((response) => {
        const data = response.data;

        setFields({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          regnum: data.regnum || "",
          gender: data.gender || "",
          mobileno: data.mobile || "",
          emailid: data.username || "",
        });

        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [profileData]);

  /* ---------------- INPUT CHANGE ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    let newErrors = {};
    let valid = true;

    if (!fields.firstname.match(/^[a-zA-Z ]*$/)) {
      newErrors.firstname = "Enter valid first name";
      valid = false;
    }

    if (!fields.lastname.match(/^[a-zA-Z ]*$/)) {
      newErrors.lastname = "Enter valid last name";
      valid = false;
    }

    const regPattern = /^[0-9]{2}[A-Za-z]{3}[0-9]{4}$/;
    if (!regPattern.test(fields.regnum)) {
      newErrors.regnum = "Invalid registration number";
      valid = false;
    }

    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(fields.mobileno)) {
      newErrors.mobileno = "Invalid mobile number";
      valid = false;
    }

    if (!fields.gender) {
      newErrors.gender = "Select gender";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  /* ---------------- SUBMIT PROFILE ---------------- */

  const submituserRegistrationForm = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const updatedData = {
      currentUserId: profileData?.id || profileData?.user?._id,
      firstname: fields.firstname,
      lastname: fields.lastname,
      regnum: fields.regnum,
      gender: fields.gender,
      mobile: fields.mobileno,
      isProfileComplete: true,
    };

    axios
      .put(
        `${process.env.REACT_APP_SERVER_URL}/user/${profileData?.id || profileData?.user?._id
        }`,
        updatedData,
        {
          headers: {
            x_authorization: `Bearer ${JSON.parse(
              secureLocalStorage.getItem("auth_token")
            )}`,
          },
        }
      )
      .then((res) => {
        toast.success("Profile updated!");
        secureLocalStorage.setItem("profile", JSON.stringify(res.data));
        navigate("/home");
      })
      .catch(() => {
        toast.error("Error saving changes.");
      });
  };

  /* ---------------- CONFIRMATION ---------------- */

  const handleConfirmationOpen = (e) => {
    e.preventDefault();
    setFormEvent(e);
    setOpenConfirmation(true);
  };

  const handleConfirmationClose = (confirmed) => {
    setOpenConfirmation(false);

    if (confirmed && formEvent) {
      submituserRegistrationForm(formEvent);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="profile-page">

        <Navbar />

        {isLoading ? (
          <div className="loading-indicator-container">
            <CircularProgress size={40} />
          </div>
        ) : (
          <div className="profile-container">

            {/* LEFT PROFILE CARD */}

            <div className="profile-left-box">
              <div className="avatar-wrapper">
                <img src={boy} alt="avatar" />
              </div>
              <h2 className="hello-text">Hello There!</h2>
            </div>


            {/* RIGHT FORM CARD */}

            <div className="profile-right-box">

              <h3 className="box-heading">Other Details</h3>

              <form
                className="profile-form-grid"
                onSubmit={(e) => {
                  if (!profileData?.user?.gender) {
                    handleConfirmationOpen(e);
                  } else {
                    submituserRegistrationForm(e);
                  }
                }}
              >

                <div className="form-group">
                  <label>First Name*</label>
                  <input
                    name="firstname"
                    value={fields.firstname || ""}
                    onChange={handleChange}
                  />
                  <div className="errorMsg">{errors.firstname}</div>
                </div>

                <div className="form-group">
                  <label>Last Name*</label>
                  <input
                    name="lastname"
                    value={fields.lastname || ""}
                    onChange={handleChange}
                  />
                  <div className="errorMsg">{errors.lastname}</div>
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Gender*</label>

                  <div className="gender-toggle">

                    <div
                      className={`gender-btn ${fields.gender === "M" ? "selected" : ""
                        }`}
                      onClick={() =>
                        setFields((prev) => ({ ...prev, gender: "M" }))
                      }
                    >
                      M
                    </div>

                    <div
                      className={`gender-btn ${fields.gender === "F" ? "selected" : ""
                        }`}
                      onClick={() =>
                        setFields((prev) => ({ ...prev, gender: "F" }))
                      }
                    >
                      F
                    </div>

                  </div>

                  <div className="errorMsg">{errors.gender}</div>
                </div>

                <div className="form-group">
                  <label>Registration Number*</label>
                  <input
                    name="regnum"
                    value={fields.regnum || ""}
                    onChange={handleChange}
                  />
                  <div className="errorMsg">{errors.regnum}</div>
                </div>

                <div className="form-group">
                  <label>Contact Number*</label>
                  <input
                    name="mobileno"
                    value={fields.mobileno || ""}
                    onChange={handleChange}
                  />
                  <div className="errorMsg">{errors.mobileno}</div>
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Email ID*</label>
                  <input
                    name="emailid"
                    value={fields.emailid || ""}
                    readOnly
                  />
                </div>

                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button className="submit-btn">
                    FINISH
                  </button>
                </div>

              </form>

            </div>

          </div>
        )}

        <Footer />

      </div>

      {/* CONFIRMATION DIALOG */}

      <Dialog
        open={openConfirmation}
        onClose={() => handleConfirmationClose(false)}
      >
        <DialogTitle>Warning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Gender can only be set once. Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmationClose(false)}>No</Button>
          <Button onClick={() => handleConfirmationClose(true)}>Yes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Profilepage;