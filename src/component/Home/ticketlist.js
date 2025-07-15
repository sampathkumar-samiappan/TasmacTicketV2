import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import nodata from '../../assets/images/no-data.gif';
import history from '../../assets/images/history.png';
import axios from 'axios';
import Footer from "../Footer/Footer";
import {
  Table,
  Tag,
  Drawer,
  Layout,
  Row,
  Col,
  Select,
  Button,
  Spin,
  Typography,
  Space,
  theme,
  Form,
  Tooltip,
  Flex,
  Modal,
  List,
  Breadcrumb,
} from "antd";
import { InfoCircleOutlined } from '@ant-design/icons';
import { CloseOutlined, DownloadOutlined, ReloadOutlined, ClockCircleTwoTone , HomeOutlined} from '@ant-design/icons';
import { toast } from "react-toastify";
import TicketForm from "../TicketForm/ticketform";
import {URL_ticket, URL_ticketlog, URL_getTicketLogs, HEADERS, BASE_URL} from "../API Config/config";
import { SearchContext } from '../Search/search';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Ticketlist.css"

const { Header } = Layout;
const { Option } = Select;
const { useToken } = theme;


const getStatusColor = (status) => {
  switch (status) {
    case "Open": return "status-tag-blue";
    case "Closed": return "status-tag-green";
    case "On Hold": return "status-tag-orange";
    case "Cancelled": return "status-tag-red";
    default: return "status-tag-gray";
  }
};

const Dashboard = () => {

  const [openResponsive, setOpenResponsive] = useState(false);
  const { Text } = Typography;
  const [ticketData, setTicketData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');

  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logData, setLogData] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Cascading filters
  const [region, setRegion] = useState('All');
  const [dm, setDM] = useState('All');
  const [depot, setDepot] = useState('All');
  const [filteredTickets, setFilteredTickets] = useState([]);

  // Options for dropdowns dynamically derived from ticketData
  const [regionOptions, setRegionOptions] = useState([]);
  const [dmOptions, setDmOptions] = useState([]);
  const [depotOptions, setDepotOptions] = useState([]);

  const { token } = useToken();
  const { searchTerm } = useContext(SearchContext);

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm?.toLowerCase() || ''), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Compute filtered tickets based on all filters and search
  useEffect(() => {
    let filtered = ticketData;

    // Filter Region
    if (region !== 'All') {
      filtered = filtered.filter(t => t.region === region);
    }

    // Filter DM
    if (dm !== 'All') {
      filtered = filtered.filter(t => t.dm === dm);
    }

    // Filter Depot
    if (depot !== 'All') {
      filtered = filtered.filter(t => t.depot === depot);
    }

    // Filter Status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(ticket => {
        return (
          (ticket.name?.toLowerCase().includes(debouncedSearchTerm)) ||
          (ticket.asset_type?.toLowerCase().includes(debouncedSearchTerm)) ||
          (ticket.assets_category?.toLowerCase().includes(debouncedSearchTerm)) ||
          (ticket.region?.toLowerCase().includes(debouncedSearchTerm)) ||
          (ticket.dm?.toLowerCase().includes(debouncedSearchTerm)) ||
          (ticket.depot?.toLowerCase().includes(debouncedSearchTerm)) ||
          (ticket.issue_type?.toLowerCase().includes(debouncedSearchTerm)) ||
          (ticket.priority?.toLowerCase().includes(debouncedSearchTerm)) ||
          (ticket.office_category?.toLowerCase().includes(debouncedSearchTerm)) ||
          (ticket.status?.toLowerCase().includes(debouncedSearchTerm))
        );
      });
    }

    setFilteredTickets(filtered);
    // Region options always from full ticketData (all tickets)
    const regionsSet = new Set(ticketData.map(t => t.region).filter(Boolean));
    setRegionOptions(['All', ...Array.from(regionsSet)]);

    // DM options filtered by Region
    let filteredForDm = ticketData;
    if (region !== 'All') {
      filteredForDm = filteredForDm.filter(t => t.region === region);
    }
    const dmSet = new Set(filteredForDm.map(t => t.dm).filter(Boolean));
    setDmOptions(['All', ...Array.from(dmSet)]);

    // Depot options filtered by Region and DM
    let filteredForDepot = ticketData;
    if (region !== 'All') {
      filteredForDepot = filteredForDepot.filter(t => t.region === region);
    }
    if (dm !== 'All') {
      filteredForDepot = filteredForDepot.filter(t => t.dm === dm);
    }
    const depotSet = new Set(filteredForDepot.map(t => t.depot).filter(Boolean));
    setDepotOptions(['All', ...Array.from(depotSet)]);

  }, [ticketData, region, dm, depot, statusFilter, debouncedSearchTerm]);

  const handleOpenDialog = (record) => {
    const newFormValues = {
      ...record,
      remarks: "", // Always start with empty remarks
    };
    setFormValues(newFormValues);
    setSelectedTicketId(record.name);
    setOpenDialog(true);
  };


  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setFormValues({});
  }, []);

  const handleChange = useCallback((e) => {
    setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("userData"));
      const username = user?.username;
      const ticketid = formValues.name;
      const remarks = formValues.remarks;

      const now = new Date();

      // IST is UTC + 5:30 (330 minutes)
      const istOffset = 330; // minutes
      const istTime = new Date(now.getTime() + istOffset * 60000);

      // Format as YYYY-MM-DD HH:MM:SS
      const formattedIST = istTime.toISOString().slice(0, 19).replace('T', ' ');

      // Save log
      await axios.post(URL_ticketlog, {
        data: {
          username,
          ticketid,
          remarks,
          datetime: formattedIST,
        },
      }, {
        headers: HEADERS,
      });

      // Update ticket
      await axios.put(`${URL_ticket}/${ticketid}`, {
        data: formValues,
      }, {
        headers: HEADERS,
      });

      toast.success("Ticket updated and log saved!");

      // ✅ Refresh table data
      fetchOffice();
      handleCloseDialog();

    } catch (error) {
      console.error("Error updating ticket or saving log:", error);
      toast.error("Failed to update ticket or save log.");
    }
  };

  //Formated date time to show in Ticket history model (***Start***)
  const formatDateTime = (datetime) => {
    const date = new Date(datetime);

    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${day}/${month}/${year} ${pad(hours)}:${minutes}:${seconds} ${ampm}`;
  };
  //Formated date time to show in Ticket history model (***End***)

  // Fetch Log from Get Ticket Logs script
  const fetchLogs = async (ticketId) => {
    try {
      const response = await axios.get(`${URL_getTicketLogs}?ticketid=${ticketId}`, {
        headers: HEADERS,
      });
      setLogData(response.data.message || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogData([]);
    }
  };





  useEffect(() => {
    fetchOffice();
  }, []);

const fetchOffice = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("userData"));

    if (!user || !user.user_type) {
      console.error("User data missing from localStorage");
      return;
    }

    const {username,user_type, region, dm, depot, shop_number, user_id } = user;

    const params = new URLSearchParams();
    params.append("usertype", user_type);

    if (user_type === "Support Team" || user_type === "Admin") {
      // No additional filters required
    } else if (user_type === "Region Admin") {
      if (region) params.append("region", region);
    } else if (user_type === "Dm Admin") {
      if (dm) params.append("dm", dm);
    } else if (user_type === "Depot Admin") {
      if (depot) params.append("depot", depot);
    } else if (user_type === "RvShop Admin") {
      if (shop_number) params.append("shop_number", shop_number);
    } else if (user_type === "Service Engineer") {
      if (user_id) params.append("assignedto", username); // This is required by the Frappe script
    }

    const url = `${BASE_URL}/api/method/get_tickets_by_user?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: HEADERS,
    });

    const jsonData = await response.json();

    if (Array.isArray(jsonData.message?.tickets)) {
      setTicketData(jsonData.message.tickets);
    } else {
      setTicketData([]);
    }
  } catch (error) {
    console.error("Error fetching tickets:", error);
  }
};


  const columns = useMemo(() => [
    {
      title: 'Ticket ID',
      dataIndex: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (text, row) => (
        <Button type="link" onClick={() => handleOpenDialog(row)}>{text}</Button>
      ),
    },
    {
      title: 'Ticket History',
      dataIndex: 'actions',
      render: (_, record) => (
        <>
          {/* <InfoCircleOutlined
            style={{ color: "#1890ff", cursor: "pointer" }}
            onClick={() => {
              setSelectedTicketId(record.name);
              setLogModalVisible(true);
              fetchLogs(record.name);
            }}
          /> */}
          <img style={{ height: "20px", width: "20px" , cursor: "pointer"}} src={history} alt="No Data" onClick={() => {
            setSelectedTicketId(record.name);
            setLogModalVisible(true);
            fetchLogs(record.name);
          }} />
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
      render: (status) => (
        <Tag className={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      sorter: (a, b) => (a.priority || '').localeCompare(b.priority || ''),
    },
    {
      title: 'Asset Type',
      dataIndex: 'asset_type',
      render: (text) => text ? text : 'N/A',

      sorter: (a, b) => (a.asset_type || '').localeCompare(b.asset_type || ''),
    },
    {
      title: 'Asset Category',
      dataIndex: 'assets_category',
      sorter: (a, b) => (a.assets_category || '').localeCompare(b.assets_category || ''),
    },
    {
      title: 'Supplier Name',
      dataIndex: 'supplier_name',
      render: (text) => text ? text : 'N/A',

      sorter: (a, b) => (a.region || '').localeCompare(b.region || ''),
    },
    {
      title: 'RV Shop',
      dataIndex: 'rvshop_no',
      render: (text) => text ? text : 'N/A',

      sorter: (a, b) => (a.dm || '').localeCompare(b.dm || ''),
    },
    {
      title: 'Depot',
      dataIndex: 'depot_name',
      render: (text) => text ? text : 'N/A',

      sorter: (a, b) => (a.depot || '').localeCompare(b.depot || ''),
    },
    // {
    //   title: 'Office Category',
    //   dataIndex: 'office_category',
    //   sorter: (a, b) => (a.office_category || '').localeCompare(b.office_category || ''),
    // },
    {
      title: 'Created On',
      dataIndex: 'creation',
      sorter: (a, b) => new Date(a.creation || 0) - new Date(b.creation || 0),
    },
    {
      title: 'Raised By',
      dataIndex: 'ticket_raised_by'
    },
    {
      title: 'Contact Number',
      dataIndex: 'raised_user_phone'
    }
  ], [handleOpenDialog]);

  //Export to excel start
  const handleExportToExcel = () => {
    const exportData = filteredTickets.map(ticket => ({
      "Ticket ID": ticket.name,
      "Asset Type": ticket.asset_type,
      "Asset Category": ticket.assets_category,
      "Region": ticket.region,
      "DM": ticket.dm,
      "Depot": ticket.depot,
      "Priority": ticket.priority,
      "Office Category": ticket.office_category,
      "Status": ticket.status,
      "Created On": ticket.creation,
      "Remarks": ticket.remarks
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "TasmacTicketList.xlsx");
  };
  //Export to excel end


  return (
    <>
    <Breadcrumb
            style={{ margin: 15 }}
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
                title: <a href="">Ticket List</a>,
              }
            ]}
          />
      <Header style={{ background: token.colorBgContainer, padding: 5 }}>
        <Row gutter={[5, 5]} style={{ height: '5px' ,paddingTop:'15px'}}>

          {/* Status Filter */}
          <Col>
            <Form.Item label="Status" style={{ marginBottom: 16 }}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                placeholder="Filter Status"
                allowClear={false}
              >
                <Option value="All">All ({ticketData.length})</Option>
                {Array.from(new Set(ticketData.map(t => t.status))).map(status => (
                  <Option key={status} value={status}>
                    <Tag className={getStatusColor(status)}>{status}</Tag> (
                    {ticketData.filter(t => t.status === status).length})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Region Filter */}
          {/* <Col>
            <Form.Item label="Region" style={{ marginBottom: 16 }}>
              <Select
                value={region}
                onChange={(value) => {
                  setRegion(value);
                  setDM('All');    // Reset DM and Depot when region changes
                  setDepot('All');
                }}
                style={{ width: 150 }}
                placeholder="Filter Region"
                allowClear={false}
              >
                {regionOptions.map(r => (
                  <Option key={r} value={r}>{r}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}

          {/* DM Filter */}
          {/* <Col>
            <Form.Item label="DM" style={{ marginBottom: 16 }}>
              <Select
                value={dm}
                onChange={(value) => {
                  setDM(value);
                  setDepot('All'); // Reset Depot when DM changes
                }}
                style={{ width: 150 }}
                placeholder="Filter DM"
                allowClear={false}
                disabled={region === 'All'} // Disable if no Region selected
              >
                {dmOptions.map(d => (
                  <Option key={d} value={d}>{d}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}

          {/* Depot Filter */}
          {/* <Col>
            <Form.Item label="Depot" style={{ marginBottom: 16 }}>
              <Select
                value={depot}
                onChange={setDepot}
                style={{ width: 150 }}
                placeholder="Filter Depot"
                allowClear={false}
                disabled={dm === 'All'} // Disable if no DM selected
              >
                {depotOptions.map(d => (
                  <Option key={d} value={d}>{d}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}

          <Col>
            <Tooltip title="Reset Filters" placement="bottom">
              <Form.Item>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setStatusFilter('All');
                    setRegion('All');
                    setDM('All');
                    setDepot('All');
                  }}
                />
              </Form.Item>
            </Tooltip>
          </Col>
          <Col>
            <Tooltip title="Export To Excel" placement="bottom">
              <Form.Item >
                <Button variant="outlined" onClick={handleExportToExcel} icon={<DownloadOutlined />} iconPosition="end">
                  Export
                </Button>
              </Form.Item>
            </Tooltip>
          </Col>
        </Row>
      </Header>

      <Spin spinning={false}>
        <div style={{ width: "100%", overflowX: "auto" }}>
          <Table
            dataSource={filteredTickets}
            columns={columns}
            rowKey="name"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        </div>
      </Spin>

      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text strong>Edit Ticket</Typography.Text>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={handleCloseDialog}
              danger
            />
          </div>
        }
        placement="right"
        onClose={handleCloseDialog}
        open={openDialog}
        width={400}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="primary" onClick={handleSave}>Save</Button>
            </Space>
          </div>
        }
      >
        <TicketForm
          key={formValues?.name}
          formValues={formValues}
          handleChange={handleChange}
          isEdit={true}
        />
      </Drawer>
      {/*Log Start*/}
      <Flex vertical gap="middle" align="flex-start">
        <Modal
          title={`Ticket History - ${selectedTicketId}`}
          open={logModalVisible}
          onCancel={() => setLogModalVisible(false)}
          footer={null}
        >
          {logData.length > 0 ? (
            <div style={{ maxHeight: logData.length > 3 ? 300 : 'auto', overflowY: logData.length > 3 ? 'auto' : 'visible' }}>
              <List
                bordered
                dataSource={logData}
                renderItem={(log, index) => (
                  <List.Item>
                    <div style={{ width: "100%" }}>
                      <Text strong>{index + 1}.</Text>{" "}
                      <Text style={{ color: '#025E73' }}>{(log.username || "Unknown").toUpperCase()}</Text>{" ,"}Edited The Ticket.<br />
                      Remark:
                      <Text style={{ color: '#025E73' }}>{(log.remarks || "—").toUpperCase()}</Text> {" "}. <br />
                      <Text type="secondary">
                        <ClockCircleTwoTone twoToneColor="#52c41a" />{" "}
                        <Text style={{ color: '#F2A71B' }}>
                          {log.datetime ? formatDateTime(log.datetime) : "No timestamp"}
                        </Text>
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Typography.Text type="secondary">
                No History Available.
              </Typography.Text>
              <br />
              <img style={{ height: "150px", width: "150px", marginTop: "10px" }} src={nodata} alt="No Data" />
            </div>

          )}
        </Modal>
      </Flex>
      {/* Ticket Log End*/}
      <Footer/>
    </>
  );
};

export default Dashboard;
