import React, { useEffect } from "react";
import { Layout, Row, Col, Select, Tag } from "antd";
import {API_URL} from "../API Config/config";

const { Header } = Layout;
const { Option } = Select;

const EnhancedNavbar = ({
  ticketCounts,
  onStatusClick,
  selectedStatus,
  assigned,
  setAssigned,
  state,
  setState,
  setStateOptions,
  setDistrictOptions,
  district,
  setDistrict,
  assignedOptions = [],
  setAssignedOptions,
  stateOptions = [],
  districtOptions = [],
}) => {
  const AUTH_HEADER = {
    Authorization: `Basic ${btoa("e83e516ccf13a60:bfc4a5bef2aaf8e")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const params = new URLSearchParams({
          fields: JSON.stringify(["state_name"]),
          distinct: "1",
        });

        const response = await fetch(`${API_URL}/State?${params.toString()}`, {
          method: "GET",
          headers: AUTH_HEADER,
        });

        const data = await response.json();
        if (data.data) {
          const states = data.data.map((item) => item.state_name);
          setStateOptions(states);
        }
      } catch (error) {
        console.error("Failed to fetch states:", error);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const filters = JSON.stringify({ user_type: "Service_engineer" });
        const params = new URLSearchParams({
          filters,
          fields: JSON.stringify(["username"]),
        });

        const response = await fetch(`${API_URL}/Ticket User?${params}`, {
          method: "GET",
          headers: AUTH_HEADER,
        });

        const data = await response.json();
        if (data.data) {
          const assignedUsers = data.data.map((item) => item.username);
          setAssignedOptions(assignedUsers);
        }
      } catch (error) {
        console.error("Failed to fetch agents:", error);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    if (!state) {
      setDistrict([]);
      setDistrictOptions([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        const filters = JSON.stringify({ state_name: state });
        const params = new URLSearchParams({
          filters,
          fields: JSON.stringify(["district_name"]),
          distinct: "1",
        });

        const response = await fetch(`${API_URL}/District?${params.toString()}`, {
          method: "GET",
          headers: AUTH_HEADER,
        });

        const data = await response.json();
        if (data.data) {
          const districts = data.data.map((item) => item.district_name);
          setDistrictOptions(districts);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      }
    };

    fetchDistricts();
  }, [state]);

  return (
    <Header
      style={{
        backgroundColor: "#fff",
        color: "#000",
        padding: "0 16px",
        height: 50,
        lineHeight: "50px",
        position: "fixed",
        top: 70,
        width: "calc(100% - 220px)",
        zIndex: 1200,
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Row gutter={[8, 8]} wrap style={{ flex: 1 }}>
        {Object.entries(ticketCounts).map(([key, value]) => (
          <Col key={key}>
            <Tag
              color={selectedStatus === key ? "blue" : "default"}
              style={{ cursor: "pointer", userSelect: "none", fontWeight: 500 }}
              onClick={() => onStatusClick(key)}
            >
              {key} ({value})
            </Tag>
          </Col>
        ))}
      </Row>

      <Row gutter={16} wrap align="middle" style={{ minWidth: 500 }}>
        <Col>
          <Select
            size="middle"
            style={{ width: 150 }}
            value={assigned}
            onChange={(val) => setAssigned(val)}
            dropdownMatchSelectWidth={false}
          >
            <Option value="All">All</Option>
            {assignedOptions.map((opt, idx) => (
              <Option key={idx} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        </Col>

        <Col>
          <Select
            size="middle"
            style={{ width: 150 }}
            value={state}
            onChange={(val) => setState(val)}
            dropdownMatchSelectWidth={false}
          >
            <Option value="All">All</Option>
            {stateOptions.map((opt, idx) => (
              <Option key={idx} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        </Col>

        <Col>
          <Select
            size="middle"
            style={{ width: 150 }}
            value={district}
            onChange={(val) => setDistrict(val)}
            dropdownMatchSelectWidth={false}
          >
            <Option value="All">All</Option>
            {districtOptions.map((opt, idx) => (
              <Option key={idx} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </Header>
  );
};

export default EnhancedNavbar;
