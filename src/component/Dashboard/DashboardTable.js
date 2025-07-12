import React, { useState, useEffect } from "react";
import {
  Table, Button, Dropdown, Checkbox, Space, Input, Row, Col, Pagination,
} from "antd";
import { DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL, HEADERS } from "../API Config/config";
import previousIcon from "../Dashboard/previous.png";

const allColumns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Office Category", dataIndex: "office_category", key: "office_category" },
  { title: "Shop Number", dataIndex: "shop_number", key: "shop_number" },
  { title: "Region", dataIndex: "region", key: "region" },
  { title: "DM", dataIndex: "dm", key: "dm" },
  { title: "Depot", dataIndex: "depot", key: "depot" },
  { title: "Assets Category", dataIndex: "assets_category", key: "assets_category" },
  { title: "Asset Type", dataIndex: "asset_type", key: "asset_type" },
  { title: "Asset ID", dataIndex: "asset_id", key: "asset_id" },
  { title: "Serial Number", dataIndex: "serial_number", key: "serial_number" },
  { title: "Issue Type", dataIndex: "issue_type", key: "issue_type" },
  { title: "Report On", dataIndex: "report_on", key: "report_on" },
  { title: "Priority", dataIndex: "priority", key: "priority" },
  { title: "Status", dataIndex: "status", key: "status" },
  { title: "Creation", dataIndex: "creation", key: "creation" },
];

const DashboardTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(allColumns.map(col => col.key));
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryParams = new URLSearchParams(location.search);
  const statusParam = queryParams.get("status");

  const handleColumnChange = (checkedValues) => {
    setSelectedColumns(checkedValues);
  };

  const handleExportToExcel = () => {
    const filteredData = tableData.map((row) => {
      const newRow = {};
      selectedColumns.forEach((colKey) => {
        const col = allColumns.find((c) => c.key === colKey);
        newRow[col?.title] = row[colKey];
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    XLSX.writeFile(workbook, "tickets.xlsx");
  };

  const handleGoToDashboard = () => {
    navigate("/app/dashboard/overview");
  };

  const filteredColumns = allColumns.filter(col => selectedColumns.includes(col.key));

  const paginatedData = tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("userData"));
        if (!storedUser?.user_type) return;
        const url = `${BASE_URL}/api/method/get_tickets_by_user_and_status?usertype=${encodeURIComponent(storedUser.user_type)}&status=${encodeURIComponent(statusParam)}`;
        const response = await axios.get(url, { headers: HEADERS });
        setTableData(response.data.message?.tickets || []);
      } catch (error) {
        console.error("Error fetching tickets by status:", error);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    if (statusParam) {
      fetchTickets();
    }
  }, [statusParam]);

  return (
    <div style={{ padding: 24 }}>
      <Row justify="start" gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Dropdown
            visible={dropdownVisible}
            onVisibleChange={setDropdownVisible}
            dropdownRender={() => (
              <div style={{ padding: 8, backgroundColor: "#ffffff" }}>
                <Checkbox
                  checked={selectedColumns.length === allColumns.length}
                  indeterminate={
                    selectedColumns.length > 0 && selectedColumns.length < allColumns.length
                  }
                  onChange={(e) => {
                    setSelectedColumns(e.target.checked ? allColumns.map((col) => col.key) : []);
                  }}
                >
                  Select All
                </Checkbox>
                <Checkbox.Group
                  value={selectedColumns}
                  onChange={handleColumnChange}
                  style={{ display: "block", marginTop: 8 }}
                >
                  <Space direction="vertical">
                    {allColumns.map((col) => (
                      <Checkbox key={col.key} value={col.key}>
                        {col.title}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </div>
            )}
          >
            <Button icon={<FilterOutlined />}>Columns</Button>
          </Dropdown>
        </Col>

        <Col>
          <Button onClick={handleGoToDashboard}>
            <img src={previousIcon} alt="Go Back" style={{ width: 16, height: 16, marginRight: 6 }} />
            Go to Dashboard
          </Button>
        </Col>

        <Col>
          <Button icon={<DownloadOutlined />} onClick={handleExportToExcel}>
            Export to Excel
          </Button>
        </Col>
      </Row>

      <Table
        columns={filteredColumns.map((col) => ({
          ...col,
          onFilter: (value, record) =>
            record[col.dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
          filterSearch: true,
          sorter: (a, b) => {
            const aVal = a[col.dataIndex];
            const bVal = b[col.dataIndex];
            if (typeof aVal === "number" && typeof bVal === "number") {
              return aVal - bVal;
            }
            return String(aVal || "").localeCompare(String(bVal || ""));
          },
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
            <div style={{ padding: 8 }}>
              <Input
                placeholder={`Search ${col.title}`}
                value={selectedKeys[0]}
                onChange={(e) => {
                  const value = e.target.value || "";
                  setSelectedKeys(value ? [value] : []);
                  confirm({ closeDropdown: false });
                }}
                style={{ width: 110, display: "block" }}
              />
            </div>
          ),
          filterIcon: (filtered) => (
            <FilterOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
          ),
        }))}
        dataSource={paginatedData}
        rowKey="name"
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={false} // Disable AntD's internal pagination
      />

      <Row justify="end" style={{ marginTop: 16 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={tableData.length}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          showSizeChanger
          pageSizeOptions={["10", "20", "50", "100"]}
        />
      </Row>
    </div>
  );
};

export default DashboardTable;
