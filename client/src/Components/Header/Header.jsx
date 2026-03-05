import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../Assets/logo.png";
import "./Header.css";

function Header() {
  const { pathname } = useLocation();
  const navigation = useNavigate();

  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const languageSelectRef = useRef(null);

  const navSideBarOpen = () => setSideBarOpen(true);
  const navSideBarClose = () => setSideBarOpen(false);

  function isActiveLink(item) {
    return pathname === item.href;
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const navItems = [
    { name: "Login", href: "/", loginNotRequired: true },
    { name: "Sign Up", href: "/signUp", loginNotRequired: true },
    {
      name: "Support",
      href: "https://forms.gle/srKbHdG9oPshAGXF9",
      target: "_blank",
      loginNotRequired: true,
    },
  ];

  const handleLanguageChange = (e) => {
    if (e.target.value === "kr-KR") {
      setShowModal(true);

      // reset dropdown back to english
      if (languageSelectRef.current) {
        languageSelectRef.current.value = "en-US";
      }
    }
  };

  useEffect(() => {
    if (showModal) {
      toast.info(
        "라… 한국어로 바꾸셨네요? 안녕하세요 해커님(Why are you trying? You don’t know Korean )",
        {
          position: "top-center",
          autoClose: 3500,
        }
      );
      setShowModal(false);
    }
  }, [showModal]);

  return (
    <header className="flex items-center justify-between px-4 border-b border-[#BEBCBD] relative">

      {/* LOGO */}
      <img
        onClick={() => navigation("/")}
        alt="room-mate-dhoondo-logo"
        src={logo}
        className="h-[60px] cursor-pointer"
      />

      {/* LANGUAGE SELECTOR (Desktop) */}
      <div className="hidden md:flex items-center relative z-40">
        <select
          ref={languageSelectRef}
          className="p-2 border rounded-md bg-white cursor-pointer text-sm md:text-base"
          onChange={handleLanguageChange}
          defaultValue="en-US"
        >
          <option value="en-US">English (United States)</option>

          <option value="kr-KR">한국어 (대한민국)</option>
        </select>
      </div>

      {/* MOBILE MENU BUTTON */}
      <div className="flex items-center md:hidden">
        {!sideBarOpen ? (
          <button onClick={navSideBarOpen}>
            <MenuIcon />
          </button>
        ) : (
          <button onClick={navSideBarClose}>
            <CloseIcon />
          </button>
        )}
      </div>

      {/* MOBILE SIDEBAR */}
      {sideBarOpen && (
        <div className="absolute left-0 top-0 h-screen w-screen bg-white z-50">

          {/* SIDEBAR HEADER */}
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <img
              onClick={() => {
                navigation("/");
                navSideBarClose();
              }}
              alt="room-mate-dhoondo-logo"
              src={logo}
              className="h-[50px] cursor-pointer"
            />

            <button onClick={navSideBarClose}>
              <CloseIcon />
            </button>
          </div>

          {/* MOBILE LANGUAGE SELECTOR */}
          <div className="p-6">
            <select
              ref={languageSelectRef}
              className="w-full p-2 border rounded-md"
              onChange={handleLanguageChange}
              defaultValue="en-US"
            >
              <option value="en-US">English</option>
              <option value="zh-CN">Chinese</option>
              <option value="kr-KR">Korean</option>
            </select>
          </div>

          {/* NAV ITEMS */}
          {navItems.map((nav) =>
            nav.loginNotRequired ? (
              nav.target ? (
                <a
                  key={nav.name}
                  onClick={navSideBarClose}
                  className={classNames(
                    "text-xl flex items-center mt-2 py-4 px-8 hover:bg-gray-100 transition"
                  )}
                  href={nav.href}
                  target={nav.target}
                  rel="noopener noreferrer"
                >
                  <div className="flex flex-col w-fit">
                    <span className="text-base font-normal capitalize">
                      {nav.name}
                    </span>

                    {isActiveLink(nav) && (
                      <span className="w-full h-[4px] bg-[#06105A]" />
                    )}
                  </div>
                </a>
              ) : (
                <Link
                  key={nav.name}
                  onClick={navSideBarClose}
                  className={classNames(
                    "text-xl flex items-center mt-2 py-4 px-8 hover:bg-gray-100 transition"
                  )}
                  to={{ pathname: nav.href }}
                >
                  <div className="flex flex-col w-fit">
                    <span className="text-base font-normal capitalize">
                      {nav.name}
                    </span>

                    {isActiveLink(nav) && (
                      <span className="w-full h-[4px] bg-[#06105A]" />
                    )}
                  </div>
                </Link>
              )
            ) : null
          )}
        </div>
      )}
    </header>
  );
}

export default Header;



/* MENU ICON */
export const MenuIcon = () => {
  return (
    <svg
      fill="black"
      viewBox="0 0 1024 1024"
      className="h-5 w-5"
    >
      <path d="M904 160H120v80h784v-80zm0 312H120v80h784v-80zm0 312H120v80h784v-80z" />
    </svg>
  );
};



/* CLOSE ICON */
export const CloseIcon = () => {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      className="h-7 w-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};