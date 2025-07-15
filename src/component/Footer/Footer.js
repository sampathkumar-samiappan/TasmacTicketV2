import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        textAlign: "right",
        padding: "1rem",
        backgroundColor: "#f9f9f9",
        borderTop: "1px solid #e0e0e0",
        fontSize: "14px",
      }}
    >
      <span>
        &copy; {year}{" "}
        <a
          href="https://www.bontonsoftwares.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#ff9006", textDecoration: "none" }}
        >
          BonTon Softwares Pvt. Ltd.
        </a>
      </span>
    </footer>
  );
};

export default Footer;
