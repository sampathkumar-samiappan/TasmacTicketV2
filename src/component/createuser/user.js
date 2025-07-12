import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  Table,
  Drawer,
  Form,
  Select,
  Space,
  Popconfirm,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { HEADERS, API_URL } from "../API Config/config";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./user.css";

const { Option } = Select;

const TicketUserManagement = () => {
  const [userData, setUserData] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState({});
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [userTypes, setUserTypes] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/TicketUser?fields=["*"]`, {
        headers: HEADERS,
      });
      const users = response.data.data;
      setUserData(users);
      setFilteredUsers(users);
    } catch (error) {
      toast.error("Failed to fetch user data");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText((prev) => ({ ...prev, [dataIndex]: selectedKeys[0] }));
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchText((prev) => ({ ...prev, [dataIndex]: "" }));
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            const value = e.target.value || "";
            setSelectedKeys([value]);
            confirm({ closeDropdown: false });
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
      </div>
    ),
    filterIcon: (filtered) => (
      <span style={{ color: filtered ? "#1890ff" : undefined }}>🔍</span>
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
  });

  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const response = await axios.get(`${API_URL}/DocType/TicketUser`, {
          headers: HEADERS,
        });
        const usertypeField = response.data.data.fields.find(
          (field) => field.fieldname === "usertype"
        );
        const options = usertypeField?.options
          ?.split("\n")
          .filter((opt) => opt.trim() !== "")
          .map((type) => ({
            label: type.trim(),
            value: type.trim(),
          }));

        setUserTypes(options || []);
      } catch (error) {
        console.error("Error fetching user types:", error);
      }
    };

    fetchUserTypes();
  }, []);

  const openDrawer = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await fetch(`${API_URL}/TicketUser/${editingUser.name}`, {
          method: "PUT",
          headers: HEADERS,
          body: JSON.stringify({ data: values }),
        });
        toast.success("User updated successfully");
      } else {
        await fetch(`${API_URL}/TicketUser`, {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify({ data: values }),
        });
        toast.success("User created successfully");
      }
      fetchUsers();
      closeDrawer();
    } catch (err) {
      console.error("Form submission error:", err);
      toast.error("Failed to save user");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${API_URL}/TicketUser/${userId}`, {
        headers: HEADERS,
      });
      toast.success("User deleted successfully");
      const updatedUsers = userData.filter((user) => user.name !== userId);
      setUserData(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete user");
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      ...getColumnSearchProps("username"),
      render: (text) =>
        text && text.toString().trim() !== "" ? text : <span style={{ color: "red" }}>N/A</span>,
    },
    {
      title: "User Type",
      dataIndex: "usertype",
      key: "usertype",
      ...getColumnSearchProps("usertype"),
      render: (text) =>
        text && text.toString().trim() !== "" ? text : <span style={{ color: "red" }}>N/A</span>,
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      ...getColumnSearchProps("region"),
      render: (text) =>
        text && text.toString().trim() !== "" ? text : <span style={{ color: "red" }}>N/A</span>,
    },
    {
      title: "Depot",
      dataIndex: "depot",
      key: "depot",
      ...getColumnSearchProps("depot"),
      render: (text) =>
        text && text.toString().trim() !== "" ? text : <span style={{ color: "red" }}>N/A</span>,
    },
    {
      title: "Dm",
      dataIndex: "dm",
      key: "dm",
      ...getColumnSearchProps("dm"),
      render: (text) =>
        text && text.toString().trim() !== "" ? text : <span style={{ color: "red" }}>N/A</span>,
    },
    {
      title: "Shop Number",
      dataIndex: "shop_number",
      key: "shop_number",
      ...getColumnSearchProps("shop_number"),
      render: (text) =>
        text && text.toString().trim() !== "" ? text : <span style={{ color: "red" }}>N/A</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openDrawer(record)} />
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.name)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: "space-between", display: "flex" }}>
        <Button type="primary" onClick={() => openDrawer()}>
          Create New User
        </Button>
        <Input.Search
          placeholder="Search by Username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
      </Space>

      <Table
        className="custom-table"
        columns={columns}
        dataSource={filteredUsers}
        rowKey="name"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredUsers.length,
          onChange: (page, pageSize) =>
            setPagination({ current: page, pageSize }),
        }}
      />

      <Drawer
        title={editingUser ? "Edit Ticket User" : "Create Ticket User"}
        width={400}
        onClose={closeDrawer}
        open={drawerVisible}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="usertype" label="User Type" rules={[{ required: true }]}>
            <Select placeholder="Select User Type">
              {userTypes.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="region" label="Region">
            <Input />
          </Form.Item>
          <Form.Item name="dm" label="DM">
            <Input />
          </Form.Item>
          <Form.Item name="depot" label="Depot">
            <Input />
          </Form.Item>
          <Form.Item name="shop_number" label="Shop Number">
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={closeDrawer}>Cancel</Button>
              <Button type="primary" onClick={handleSubmit}>
                {editingUser ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Toast Notification Container */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default TicketUserManagement;
