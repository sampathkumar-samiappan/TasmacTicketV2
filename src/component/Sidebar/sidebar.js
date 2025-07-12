import { useEffect, useState } from "react";
import {
  Menu,
  Layout,
  Typography,
  Drawer,
} from "antd";
import {
  HomeOutlined,
  AppstoreAddOutlined,
  BarChartOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  DashboardOutlined,
  BankOutlined,
  ExperimentOutlined,
  ToolOutlined,
  SyncOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse, isMobile, drawerOpen, toggleDrawer }) => {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.user_type) {
      setUserType(userData.user_type);
    }
  }, []);

  const allItems = [
    { label: "Home", icon: <HomeOutlined />, path: "/app/users/tickets" },
    { label: "Dashboard", icon: <DashboardOutlined />, path: "/app/dashboard/overview" },
    { label: "Create Ticket", icon: <AppstoreAddOutlined />, path:"/app/tickets/create" },
    { label: "Location", icon: <EnvironmentOutlined />, path: "/app/master/locations" },
    { label: "Reports", icon: <BarChartOutlined />, path: "/app/analytics/reports" },
    { label: "Assets", icon: <BankOutlined />, path:"/app/master/assets" },
    { label: "Projects", icon: <ExperimentOutlined />, path: "/app/master/projects"},
    { label: "User Settings", icon: <SettingOutlined />, path: "/app/users/settings" },
    { label: "Faulty Asset", icon: <ToolOutlined />, path: "/app/master/faultyassets" },
    { label: "Replacement Asset", icon: <SyncOutlined />, path: "/app/master/replacementassets" },
    { label: "Scrap Asset", icon: <DeleteOutlined />, path: "/app/master/scrapassets" },
  ];

  const allowedLabelsByRole = {
    Admin: ["Home", "Dashboard", "Reports","Create Ticket","Assets","User Settings","Faulty Asset","Replacement Asset","Scrap Asset"],
    "Support Team": ["Create Ticket","Home"],
    "Service Engineer": ["Home"],
    "Region Admin":["Home", "Reports","Create Ticket","Assets"],
    "Dm Admin": ["Assets", "Create Ticket","Dashboard"],
    "Depot Admin": ["Assets", "Create Ticket"],
    "RvShop Admin": ["Assets", "Create Ticket"],
  };

  const allowedLabels = allowedLabelsByRole[userType] || [];

  const items = allItems.filter(item => allowedLabels.includes(item.label));

  const menu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[currentLocation.pathname]}
      style={{
        backgroundColor: "#3f3c47",
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
      }}
      items={items.map((item) => ({
        key: item.path,
        icon: item.icon,
        label: <Typography.Text style={{ color: "white" }}>{item.label}</Typography.Text>,
        onClick: () => {
          navigate(item.path);
          if (isMobile) toggleDrawer(); // close drawer on mobile
        },
      }))}
    />
  );

  if (isMobile) {
    return (
      <Drawer
        title="Menu"
        placement="left"
        onClose={toggleDrawer}
        open={drawerOpen}
        bodyStyle={{ padding: 0, backgroundColor: "#3f3c47" }}
      >
        {menu}
      </Drawer>
    );
  }

  return (
    <Sider
      width={200}
      collapsedWidth={80}
      style={{
        height: "100vh",
        position: "fixed",
        top: 60,
        left: 0,
        zIndex: 1200,
        paddingTop:"5px",
        background: "#3f3c47",
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        Sider:"false"
      }}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
    >
      {menu}
    </Sider>
  );
};

export default Sidebar;
