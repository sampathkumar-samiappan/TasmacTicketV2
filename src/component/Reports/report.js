import React, { useState, useEffect } from "react";
import BackToTopButton from '../BackToTop/BackToTopButton';
import {
  Card,
  Radio,
  DatePicker,
  Select,
  Button,
  Table,
  Input,
  Typography,
  Space,
  message,
  Drawer,
  Dropdown,
  Checkbox,
  Menu,
  Modal,
  Divider,
  Descriptions,
  Breadcrumb,
} from "antd";
import axios from "axios";
import { HEADERS, BASE_URL } from "../API Config/config";
import {
  FileExcelOutlined,
  FilterOutlined,
  FilePdfOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ... all your imports remain the same

const List = () => {
  const [day, setDay] = useState("Today");
  const [range, setRange] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [open, setOpen] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData"));
  const {
    user_type: usertype,
    region,
    dm,
    depot,
    shop_number,
  } = userData || {};

  const [filters, setFilters] = useState({
    name: "",
    office_category: "",
    region: "",
    dm: "",
    depot: "",
    shop_number: "",
    assets_category: "",
    asset_type: "",
    assignedto: "",
    remarks: "",
    priority: "",
    status: "",
  });

  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    office_category: true,
    region: true,
    dm: true,
    depot: true,
    shop_number: true,
    assets_category: true,
    asset_type: true,
    assignedto: true,
    remarks: true,
    priority: true,
    status: true,
  });

  useEffect(() => {
    handleSubmit();
  }, []);

  const handleSubmit = async () => {
    const url = `${BASE_URL}/api/method/get_ticket_report_by_day`;
    const params = new URLSearchParams();

    params.append("usertype", usertype);
    if (region) params.append("region", region);
    if (dm) params.append("dm", dm);
    if (depot) params.append("depot", depot);
    if (shop_number) params.append("shop_number", shop_number);
    params.append("report_day", day);

    if (day === "Custom") {
      if (!range || range.length !== 2) {
        message.warning("Please select from and to dates.");
        return;
      }
      params.append("from_date", range[0].format("YYYY-MM-DD"));
      params.append("to_date", range[1].format("YYYY-MM-DD"));
    }

    try {
      const response = await axios.get(`${url}?${params.toString()}`, {
        headers: HEADERS,
      });
      const result = response.data.message.tickets || [];
      setData(result);
      setFilteredData(result);
      setShowTable(true);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch ticket data.");
    }
  };

  const handleReset = () => {
    setDay("");
    setRange([]);
    setFilters({
      name: "",
      office_category: "",
      region: "",
      dm: "",
      depot: "",
      shop_number: "",
      assets_category: "",
      asset_type: "",
      assignedto: "",
      remarks: "",
      priority: "",
      status: "",
    });
    setData([]);
    setFilteredData([]);
    setShowTable(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const filtered = data.filter((item) =>
      Object.keys(filters).every((key) => {
        const itemValue = (item[key] || "").toString().toLowerCase();
        const filterValue = (filters[key] || "").toLowerCase();
        return itemValue.includes(filterValue);
      })
    );
    setFilteredData(filtered);
  }, [filters, data]);

  const visibleColumnKeys = Object.keys(visibleColumns).filter(
    (key) => visibleColumns[key]
  );
  const columnWidth = 140; // Set fixed pixel width
  const allColumns = [
    "name",
    "office_category",
    "region",
    "dm",
    "depot",
    "shop_number",
    "assets_category",
    "asset_type",
    "assignedto",
    "remarks",
    "priority",
    "status",
  ].map((key) => ({
    title: (
      <div style={{ textAlign: "center" }}>
        <Text strong>
          {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Text>
        <Input
          placeholder={`Search ${key}`}
          value={filters[key]}
          onChange={(e) => handleFilterChange(key, e.target.value)}
          allowClear
          size="middle"
          style={{
            marginTop: 6,
            width: "100%",
            padding: "6px 10px",
            fontSize: 14,
            borderRadius: 6,
          }}
        />
      </div>
    ),
    dataIndex: key,
    key,
    sorter: (a, b) => (a[key] || "").localeCompare(b[key] || ""),
    width: columnWidth,
    render: (text, record) =>
      key === "name" ? (
        <Button type="link" onClick={() => openModal(record)}>
          {text}
        </Button>
      ) : (
        text
      ),
  }));

  const columns = allColumns.filter((col) => visibleColumns[col.key]);

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getVisibleColumnNames = () =>
    Object.keys(visibleColumns).filter((key) => visibleColumns[key]);

  const menu = (
    <Menu>
      {allColumns.map((col) => (
        <Menu.Item key={col.key}>
          <Checkbox
            checked={visibleColumns[col.key]}
            onChange={() => toggleColumn(col.key)}
          >
            {col.title.props.children[0].props.children}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const exportToExcel = () => {
    const visibleKeys = getVisibleColumnNames();
    const exportData = filteredData.map((row) =>
      visibleKeys.reduce((acc, key) => {
        const label = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        acc[label] = row[key];
        return acc;
      }, {})
    );
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "Ticket_Report_Visible.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text("Ticket Details", 10, y);
    y += 10;
    modalData.forEach(({ label, value }) => {
      doc.setFontSize(12);
      doc.text(`${label}: ${value}`, 10, y);
      y += 8;
    });
    doc.save("ticket-details.pdf");
  };

  const openModal = (record) => {
    const visibleFields = getVisibleColumnNames();
    const modalContent = visibleFields.map((key) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: record[key],
    }));
    setModalData(modalContent);
    setShowModal(true);
  };

  return (
    <>
    <div>
      {/* <Title level={3}>Ticket Report</Title> */}
      <Breadcrumb
      style={{margin:15}}
        items={[
          {
            title: (
              <>
                <HomeOutlined />
                <span style={{ marginLeft: 4 }}>Home</span>
              </>
            ),
          },
          {
            title: <a href="">Reports</a>,
          }
        ]}
      />
      <Space style={{ marginBottom: 16 }}>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button icon={<FilterOutlined />}>Columns</Button>
        </Dropdown>
        <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
          Export Excel
        </Button>
        <Button icon={<FilterOutlined />} onClick={() => setOpen(true)}>
          Filter Tickets
        </Button>
      </Space>

      <Drawer
        title="Filter Tickets"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={300}
      >
        <Radio.Group
          onChange={(e) => setDay(e.target.value)}
          value={day}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="Today">Today</Radio.Button>
          <Radio.Button value="Yesterday">Yesterday</Radio.Button>
          <Radio.Button value="Custom">Custom</Radio.Button>
        </Radio.Group>

        {day === "Custom" && (
          <RangePicker
            onChange={(dates) => setRange(dates || [])}
            value={range}
            style={{ marginBottom: 16, width: "100%" }}
            format="YYYY-MM-DD"
          />
        )}

        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={handleReset}>Reset</Button>
          <Button
            type="primary"
            onClick={() => {
              setOpen(false);
              handleSubmit();
            }}
          >
            Submit
          </Button>
        </Space>
      </Drawer>

      {showTable && (
        <Card>
          <Table
            className="custom-table"
            columns={columns}
            dataSource={filteredData}
            rowKey="name"
            scroll={{ x: columns.length * columnWidth }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: filteredData.length,
              onChange: (page, pageSize) =>
                setPagination({ current: page, pageSize }),
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
          />
        </Card>
      )}

      {showModal && (
        <Modal
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button
              key="pdf"
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={downloadPDF}
            >
              Download PDF
            </Button>,
            <Button key="close" onClick={() => setShowModal(false)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          <div style={{ padding: "10px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>Ticket Report Details</h2>
            </div>
            <Divider />
            <Descriptions
              bordered
              column={1}
              labelStyle={{ fontWeight: "bold", width: 150 }}
              contentStyle={{ textAlign: "left", backgroundColor: "#fafafa" }}
            >
              {modalData.map(({ label, value }) => (
                <Descriptions.Item label={label} key={label}>
                  {value || "-"}
                </Descriptions.Item>
              ))}
            </Descriptions>
            <Divider />
          </div>
        </Modal>
      )}
    </div>
    <BackToTopButton />
    </>
  );
};

export default List;
