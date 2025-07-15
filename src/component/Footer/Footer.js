import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      textAlign: "right",
      padding: "1rem",
      backgroundColor: "#f9f9f9",
      borderTop: "1px solid #e0e0e0",
      fontSize: "14px"
    }}>
      <span>
        &copy; {year}{" "}
        <span style={{ color: "#ff9006" }}>
         BonTon Softwares Pvt. Ltd. | www.bontonsoftwares.com
        </span>
      </span>
    </footer>
  );
};

export default Footer;
