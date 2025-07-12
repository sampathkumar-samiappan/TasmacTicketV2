import React, { useState,useEffect } from "react";
import { Form, Input, Button, Checkbox, Typography, Row, Col, Card,message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BtLogo from "../Login/btlogo-removebg-preview.png";
import { MessageOutlined, AppstoreOutlined,FileDoneOutlined } from "@ant-design/icons";
import "./Login.css";
import {BASE_URL} from "../API Config/config";
const { Title, Text, Paragraph } = Typography;
const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
// ✅ Clear localStorage and sessionStorage on login page load
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  const onFinish = async (values) => {
  const { username, password } = values;
  setLoading(true);

  try {
    const response = await axios.get(`${BASE_URL}/api/method/ticket_login`, {
      params: { username, password },
      withCredentials: false
    });

    const data = response.data;
    if (data.message && data.message.username) {
      console.log("User data received:", data.message);

      // Format current login time (IST)
      const now = new Date();
      const formattedCurrentLoginTime = now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata"
      }).replace(",", "").replaceAll("/", "-");

      // Format last login time from API
      let formattedLastLoginTime = "";
      if (data.message.last_login_time) {
        const lastLoginDate = new Date(data.message.last_login_time);
        formattedLastLoginTime = lastLoginDate.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata"
        }).replace(",", "").replaceAll("/", "-");
      }

      const userDataWithLoginTime = {
        ...data.message,
        login_time: formattedCurrentLoginTime,
        last_login_time: formattedLastLoginTime
      };

      localStorage.setItem("userData", JSON.stringify(userDataWithLoginTime));

      // Redirect based on user type to first allowed sidebar route
      const userType = data.message.user_type;

      const allowedLabelsByRole = {
        Admin: ["Home", "Dashboard", "Reports", "Create Ticket", "Assets", "User Settings"],
        "Support Team": ["Create Ticket"],
        "Service Engineer": ["Home"],
        "Region Admin": ["Home", "Reports", "Create Ticket", "Assets"],
        "Dm Admin": ["Assets", "Create Ticket"],
        "Depot Admin": ["Assets", "Create Ticket"],
        "RvShop Admin": ["Assets", "Create Ticket"],
      };

      const allItems = [
        { label: "Home", path: "/app/users/tickets" },
        { label: "Dashboard", path: "/app/dashboard/overview" },
        { label: "Create Ticket", path: "/app/tickets/create" },
        { label: "Location", path: "/app/master/locations" },
        { label: "Reports", path: "/app/analytics/reports" },
        { label: "Assets", path: "/app/master/assets" },
        { label: "Projects", path: "/app/master/projects" },
        { label: "User Settings", path: "/app/users/settings" },
      ];

      const allowedLabels = allowedLabelsByRole[userType] || [];
      const firstAllowedLabel = allowedLabels[0];

      const firstMenuItem = allItems.find(item => item.label === firstAllowedLabel);

      if (firstMenuItem) {
        navigate(firstMenuItem.path);  // 🔁 Redirect to first menu item
      } else {
        navigate("/home"); // fallback
      }

      message.success("Login successful!");
    } else {
      message.error("Enter valid credentials.");
    }
  } catch (error) {
    message.error("Invalid username or password.");
  } finally {
    setLoading(false);
  }
};


  return (
    <Row style={{ minHeight: "100vh" }}>
      {/* Left Section with Info */}
      <Col xs={0} md={14} className="info-panel">
        <div className="info-content">
          <Title style={{ color: "#fff" }}>Welcome to Bonton </Title>
          <Paragraph style={{ color: "#f0f0f0", fontSize: 16 }}>
            Manage your assets efficiently and get real-time support with our powerful Helpdesk system.
          </Paragraph>

          <div className="info-block">
            <AppstoreOutlined className="info-icon" />
            <div>
              <Text strong style={{ color: "#fff", fontSize: 16 }}>Asset Management</Text>
              <Paragraph style={{ color: "#d9d9d9" }}>
                Track, allocate, and monitor your company assets with accuracy and insights.
              </Paragraph>
            </div>
          </div>

          <div className="info-block">
            <MessageOutlined className="info-icon" />
            <div>
              <Text strong style={{ color: "#fff", fontSize: 16 }}>Helpdesk System</Text>
              <Paragraph style={{ color: "#d9d9d9" }}>
                Raise tickets, assign agents, and resolve issues efficiently with a robust support system.
              </Paragraph>
            </div>
          </div>
<div className="info-block">
  <FileDoneOutlined className="info-icon" />
  <div>
    <Text strong style={{ color: "#fff", fontSize: 16 }}>Ticket Management</Text>
    <Paragraph style={{ color: "#d9d9d9" }}>
      Manage the full lifecycle of support tickets — from creation to resolution — ensuring timely updates, status tracking, and user satisfaction.
    </Paragraph>
  </div>
</div>

        </div>
      </Col>

      {/* Right Section with Login */}
      <Col xs={24} md={10} className="login-panel">
        <Card className="login-card">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img src={BtLogo} alt="Bonton Logo" style={{ width: 120 }} />
            <Title level={3} style={{ marginTop: 16 }}>Sign in to continue</Title>
            <Text type="secondary">Access your asset and helpdesk dashboard</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email or Username"
              name="username"
              rules={[{ required: true, message: "Please input your email or username!" }]}
            >
              <Input placeholder="Enter your email or username" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Login
              </Button>
            </Form.Item>

            <div style={{ textAlign: "right" }}>
              <a href="/">Forgot password?</a>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;