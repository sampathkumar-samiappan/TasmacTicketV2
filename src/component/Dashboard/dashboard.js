import React, { useEffect, useState } from "react";
import Spinner from '../spinner/spinner';
import Footer from "../Footer/Footer";

import {
  Row,
  Col,
  Card,
  Typography,
  List,
  Badge,
  Spin, Tooltip, Select, Button, Form, message, Breadcrumb
} from "antd";
import {
  BulbOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  PieChartOutlined,
  CloseCircleOutlined,
  HomeOutlined
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Label, LabelList
} from "recharts";
import axios from "axios";
import { HEADERS, URL_getTicketSummary, BASE_URL, URL_getAssetSummary, URL_ticket } from "../API Config/config";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Link } from "react-router-dom";
import GradientDoughnutChart from "../Dashboard/GradientDoughnutChart";
import CountUp from 'react-countup';
const { Title, Text } = Typography;
// Color palette for Pie Chart
const colors = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

const priorities = [
  { level: "High", value: 78 },
  { level: "Medium", value: 76 },
  { level: "Low", value: 60 },
];
const COLORS = [
  "#005997",  // dark blue
  "#48acb0",  // teal
];
const GRADIENT_IDS = ["grad-blue", "grad-orange", "grad-red", "grad-yellow"];
const COLOR = [
  "#3B82F6",  // blue start color for legend gradient
  "#F97316",  // orange start color
  "#EF4444",  // red start color
  "#EAB308",  // yellow start color
];
//for select in region summary
const { Option } = Select;

const Dashboard = () => {
  const [cardData, setCardData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [ticketDueTimes, setTicketDueTimes] = useState([]);
  const [priorityCounts, setPriorityCounts] = useState([]);
  const [sourceCounts, setSourceCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const CARD_HEIGHT = 390; // consistent height for all cards
  const CONTENT_HEIGHT = 300; // height for content inside the card


  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("userData"));

        if (!storedUser || !storedUser.user_type) {
          console.error("User data not found in localStorage");
          return;
        }

        const { user_type, dm, depot, region, shop_number } = storedUser;

        let summaryUrl = `${BASE_URL}/api/method/get_ticket_priority_count`;

        const params = new URLSearchParams({ usertype: user_type });

        // Apply filters based on user_type
        if (user_type === "Dm Admin" && dm) {
          params.append("dm", dm);
        } else if (user_type === "Depot Admin" && depot) {
          params.append("depot", depot);
        } else if (user_type === "Support Team" && region) {
          params.append("region", region);
        } else if (user_type === "RvShop Admin" && shop_number) {
          params.append("shop_number", shop_number);
        }

        // Fetch API
        const response = await axios.get(`${summaryUrl}?${params.toString()}`, {
          headers: HEADERS,
        });

        const statusCounts = response.data.message.status_counts;

        const formattedCards = [

          {
            title: "Open",
            count: statusCounts["Open"] || 0,
            icon: BulbOutlined,
            background: "linear-gradient(135deg, #60a5fa, #3b82f6)", // deeper sky blue 
          },
          {
            title: "Closed",
            count: statusCounts["Closed"] || 0,
            icon: CheckCircleOutlined,
            background: "linear-gradient(135deg, #2dd4bf, #0ea5e9)", // deeper teal to blue  
          },
          {
            title: "On Hold",
            count: statusCounts["On Hold"] || 0,
            icon: PauseCircleOutlined,
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)", // golden yellow gradient
          },
          {
            title: "Cancelled",
            count: statusCounts["Cancelled"] || 0,
            icon: CloseCircleOutlined,
            background: "linear-gradient(135deg, #f87171, #ef4444)", // red gradient
          },

        ];
        setCardData(formattedCards);
      } catch (error) {
        console.error("Error fetching ticket status summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusCounts();
  }, []);


  // Fetch ticket summary data for charts and lists
  useEffect(() => {
    const fetchTicketSummary = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("userData"));

        if (!storedUser || !storedUser.user_type) {
          console.error("User data not found in localStorage");
          return;
        }

        let summaryUrl = `${BASE_URL}/api/method/get_ticket_priority_count`;
        const { user_type, dm, depot, region, shop_number } = storedUser;

        const params = new URLSearchParams({ usertype: user_type });

        // Append filters based on user_type
        if (user_type === "Dm Admin" && dm) {
          params.append("dm", dm);
        } else if (user_type === "Depot Admin" && depot) {
          params.append("depot", depot);
        } else if (user_type === "Support Team" && region) {
          params.append("region", region);
        } else if (user_type === "RvShop Admin" && shop_number) {
          params.append("shop_number", shop_number);
        }

        // Final API call
        const response = await axios.get(`${summaryUrl}?${params.toString()}`, {
          headers: HEADERS,
        });

        const result = response.data.message;

        // Priority Counts
        const priorityList = Object.entries(result.priority_counts || {}).map(
          ([level, count]) => ({
            level,
            count,
            color:
              level.toLowerCase() === "high"
                ? "#ff3d00"
                : level.toLowerCase() === "medium"
                  ? "#fbc02d"
                  : "#4caf50",
          })
        );
        setPriorityCounts(priorityList);

        // Category Pie Chart
        const pieList = Object.entries(result.ticket_category_counts || {}).map(
          ([category, count]) => ({
            name: category,
            value: count,
          })
        );
        setSourceCounts(pieList);

        // Weekly Status Chart
        const weeklyData = (result.weekly_status_counts || []).map(item => ({
          date: item.date,
          Open: item.Open || 0,
          Closed: item.Closed || 0,
          "On Hold": item["On Hold"] || 0,
          Cancelled: item.Cancelled || 0,
        }));
        setDailyData(weeklyData);



      } catch (error) {
        console.error("Failed to fetch ticket summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketSummary();
  }, []);
  //for region summary
  //new enhancement for region
  const [regionData, setRegionData] = useState([]);

  useEffect(() => {
    axios
      .get(URL_getTicketSummary + "?usertype=Admin", { headers: HEADERS })
      .then((res) => {
        const summary = res.data.message?.region_status_summary || [];
        const filtered = summary.filter((item) => item.region); // remove null regions
        setRegionData(filtered);
      })
      .catch((err) => {
        console.error("Error fetching region summary:", err);
      });
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          <strong>{label}</strong>
          <div style={{ color: "#8CCDEB" }}>Open: {data.Open}</div>
          <div style={{ color: "#B0DB9C" }}>Closed: {data.Closed}</div>
          <div style={{ color: "#FCEF91 " }}>On Hold: {data["On Hold"]}</div>
          <div style={{ color: "#F75A5A" }}>Cancelled: {data.Cancelled}</div>
        </div>
      );
    }
    return null;
  };
  //new enhancement for region
  //for region summary
  //Asset type counts
  const [assetTypeData, setAssetTypeData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [assetregionData, setAssetRegionData] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("userData"));
      const { user_type, region, dm, depot, shop_number } = user;

      try {
        const response = await axios.get(`${URL_getAssetSummary}`, {
          params: {
            usertype: user_type,
            region,
            dm,
            depot,
            shop_number
          }
        });

        const data = response.data.message;

        const typeData = Object.entries(data.asset_type_counts || {}).map(
          ([type, count]) => ({ type, count })
        );

        const statusData = Object.entries(data.status_counts || {}).map(
          ([status, value]) => ({ name: status, value })
        );

        const regionData = Object.entries(data.region_counts || {}).map(
          ([region, count]) => ({ region, count })
        );

        setAssetTypeData(typeData);
        setStatusData(statusData);
        setAssetRegionData(regionData);

      } catch (error) {
        console.error("Error fetching asset summary:", error);
      }
    };

    fetchData();
  }, []);

  const pieColors = ["#945034", "#52c41a", "#FFDDAB", "#5F8B4C", "#722ed1", "#13c2c2"];
  //for dm depot wise count
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);

  const [dmSummary, setDMSummary] = useState([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/method/get_region`,
          { headers: HEADERS }
        );

        if (response.data?.message?.regions) {
          const rawRegions = response.data.message.regions.filter(
            (region) => region !== null && region !== ""
          );
          const uniqueRegions = [...new Set(rawRegions)];
          setRegions(uniqueRegions);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
        message.error("Failed to load regions");
      }
    };
    fetchRegions();
  }, []);



  // Submit handler to fetch DM status summary
  const [flattenedData, setFlattenedData] = useState([]);

  const handleSubmit = async (region) => {
    if (!region) return;

    setHierarchyLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/method/get_ticket_priority_count?usertype=Admin&region=${region}`
      );

      const summary = response.data.message.dm_status_summary;
      setDMSummary(summary);

      const flattened = flattenSummaryData(summary);
      setFlattenedData(flattened);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setHierarchyLoading(false);
    }
  };


  const handleReset = () => {
    setSelectedRegion(null);
    setDMSummary([]);
    setFlattenedData([]);
  };


  const flattenSummaryData = (summary) => {
    const result = [];

    summary.forEach((dm) => {
      result.push({
        name: `${dm.dm} (DM)`,
        type: "DM",
        Open: dm.Open,
        Closed: dm.Closed,
        "On Hold": dm["On Hold"],
        Cancelled: dm.Cancelled,
      });

      dm.depots.forEach((depot) => {
        result.push({
          name: `${depot.depot} (Depot)`,
          type: "Depot",
          Open: depot.Open,
          Closed: depot.Closed,
          "On Hold": depot["On Hold"],
          Cancelled: depot.Cancelled,
        });

        depot.shops.forEach((shop) => {
          result.push({
            name: shop.shop_number || "N/A",
            type: "Shop",
            Open: shop.Open,
            Closed: shop.Closed,
            "On Hold": shop["On Hold"],
            Cancelled: shop.Cancelled,
          });
        });
      });
    });

    return result;
  };
  const CustomTooltips = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            padding: 10,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <strong style={{ fontWeight: "600", fontSize: 14 }}>{label}</strong>
          <p style={{ color: "#8CCDEB", margin: 0 }}>Open: {data.Open}</p>
          <p style={{ color: "#B0DB9C", margin: 0 }}>Closed: {data.Closed}</p>
          <p style={{ color: "#FCEF91", margin: 0 }}>On Hold: {data["On Hold"]}</p>
          <p style={{ color: "#F75A5A", margin: 0 }}>Cancelled: {data.Cancelled}</p>
        </div>


      );
    }
    return null;
  };



  return (

    // <Spin spinning={loading} tip="Loading Dashboard...">
    <>
      {loading ? <Spinner /> : (
         <>
      <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
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
              title: <a href="">Dashboard</a>,
            }
          ]}
        />
        {/* Top Status Cards */}
        <Row gutter={[24, 24]}>
          {cardData.map(({ title, count, icon: Icon, background }) => (
            <Col xs={24} sm={12} md={6} key={title}>
              {/* <Tooltip title={`${title} Tickets`}> */}
              <Card
                style={{
                  borderRadius: 16,
                  background: background,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  cursor: "default",
                  position: "relative",
                }}
                bodyStyle={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: 100,
                  padding: 16,
                }}
                hoverable
              >
                <div>
                  <Title level={5} style={{ margin: 0, color: "#fff" }}>{title}</Title>
                  {/* <Title level={2} style={{ margin: 0, color: "#fff" }}>{count.toLocaleString()}</Title> */}
                  <Title level={2} style={{ margin: 0, color: "#fff" }}>
                    <CountUp end={count} duration={2} separator="," />
                  </Title>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "50%" }} />
                  <div style={{ width: 12, height: 12, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "50%" }} />
                  <div style={{ width: 8, height: 8, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "50%" }} />
                  <div style={{ width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.2)", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "50%" }}>
                    <Icon style={{ fontSize: 24, color: "#fff" }} />
                  </div>
                </div>

                <div style={{ position: "absolute", bottom: 8, right: 16 }}>
                  <Link to={`/app/dashboard/tableoverview?status=${title}`} style={{ color: "#fff", fontSize: 12 }}>See All &gt;</Link>
                </div>
              </Card>
              {/* </Tooltip> */}
            </Col>
          ))}
        </Row>

        {/* Charts Row */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 20 }}>

          {/* Priority Gauge Chart */}
          <Card
            title="Priority Gauge Chart"
            bordered={false}
            style={{
              flex: "1 1 500px",
              height: 390,
              borderRadius: 16,
              border: "1px solid #d9d9d9",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              padding: 24,
              textAlign: "center",
            }}
          >
            <Row justify="center" style={{ marginBottom: 20 }}>
              {priorityCounts.map(({ level, count, color }) => (
                <Col key={level} span={6} style={{ textAlign: "center" }}>
                  <Typography.Text strong style={{ color }}>
                    ● {count} {level}
                  </Typography.Text>
                </Col>
              ))}
            </Row>

            <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto" }}>
              <div style={{ position: "absolute", width: "100%", height: "100%" }}>
                <CircularProgressbarWithChildren
                  value={priorities[2].value}
                  styles={buildStyles({
                    pathColor: "url(#lowGradient)",
                    trailColor: "#f0f0f0",
                    strokeLinecap: "butt",
                  })}
                />
              </div>

              <div style={{ position: "absolute", width: "85%", height: "85%", top: "7.5%", left: "7.5%" }}>
                <CircularProgressbarWithChildren
                  value={priorities[1].value}
                  styles={buildStyles({
                    pathColor: "url(#mediumGradient)",
                    trailColor: "#f0f0f0",
                    strokeLinecap: "butt",
                  })}
                />
              </div>

              <div style={{ position: "absolute", width: "70%", height: "70%", top: "15%", left: "15%" }}>
                <CircularProgressbarWithChildren
                  value={priorities[0].value}
                  styles={buildStyles({
                    pathColor: "url(#highGradient)",
                    trailColor: "#f0f0f0",
                    strokeLinecap: "butt",
                  })}
                />
              </div>

            </div>
          </Card>

          {/* Category Distribution Chart */}
          <Card
            bordered={false}
            style={{
              flex: "1 1 500px",
              height: CARD_HEIGHT,
              borderRadius: 16,
              border: "1px solid #d9d9d9",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              padding: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3 style={{ textAlign: "center", marginBottom: 10, fontWeight: 600 }}>
              Category Distribution
            </h3>
            <div
              style={{
                height: 1,
                backgroundColor: "#e8e8e8",
                margin: "0 16px 10px",
              }}
            />
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>

              <div style={{ width: 300, height: 300 }}>
                <GradientDoughnutChart dataSource={sourceCounts} />
              </div>
            </div>
          </Card>



        </div>

        {/* Weekly Ticket Status Summary */}
        <Row style={{ marginTop: 32 }}>
          <Col span={24}>
            <Card title="Weekly Ticket Status Summary" bordered={false}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dailyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  barSize={15}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date">
                    <Label
                      value="Date "
                      offset={-50}
                      position="insideBottom"
                      style={{ fontWeight: "bolder", fontSize: 20, fill: "#333" }}
                    />
                  </XAxis>
                  <YAxis>
                    <Label
                      value=" Count "
                      angle={-90}
                      position="insideLeft"
                      offset={-5}
                      style={{ textAnchor: "middle", fontWeight: "bolder", fontSize: 20, fill: "#333" }}
                    />
                  </YAxis>
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Open" fill="#8CCDEB" radius={[20, 20, 0, 0]} />
                  <Bar dataKey="Closed" fill="#B0DB9C" radius={[20, 20, 0, 0]} />
                  <Bar dataKey="On Hold" fill="#FCEF91" radius={[20, 20, 0, 0]} />
                  <Bar dataKey="Cancelled" fill="#F75A5A" radius={[20, 20, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>


        {/*  */}
        <Row style={{ marginTop: 32 }}>
          <Col span={24}>
            <Card title="Region Summary" bordered={false}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  layout="vertical"
                  data={regionData}
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="region" type="category" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Open" stackId="a" fill="#8CCDEB" />
                  <Bar dataKey="Closed" stackId="a" fill="#B0DB9C" />
                  <Bar dataKey="On Hold" stackId="a" fill="#FCEF91" />
                  <Bar dataKey="Cancelled" stackId="a" fill="#F75A5A" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
        {/*  */}

        {/* for region dm depot shopno */}
        <Row style={{ marginTop: 32 }}>
          <Col span={24}>
            <Card title="DM and Depot Status" bordered={false}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <Select
                  placeholder="Select Region"
                  style={{ width: 200 }}
                  value={selectedRegion}
                  onChange={(value) => {
                    setSelectedRegion(value);
                    handleSubmit(value);
                  }}
                  allowClear
                >
                  {regions.map((region) => (
                    <Option key={region} value={region}>
                      {region}
                    </Option>
                  ))}
                </Select>
                <Button onClick={handleReset} danger>
                  Reset
                </Button>
              </div>

              {hierarchyLoading ? (
                <Spin />
              ) : (
                flattenedData.length > 0 && (
                  <>
                    {console.log("flattenedData", flattenedData)}
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={flattenedData}
                        margin={{ top: 40, right: 30, left: 30, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip content={<CustomTooltips />} />
                        <Legend verticalAlign="top" />
                        <Bar dataKey="Open" stackId="a" fill="#8CCDEB" />
                        <Bar dataKey="Closed" stackId="a" fill="#B0DB9C" />
                        <Bar dataKey="On Hold" stackId="a" fill="#FCEF91" />
                        <Bar dataKey="Cancelled" stackId="a" fill="#F75A5A" />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )
              )}
            </Card>
          </Col>
        </Row>


        {/* for region dm depot shopno */}

        {/* for asset */}
        {/* Additional Chart Row with 60/40 Layout */}
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            marginTop: 20,
            width: "100%",
          }}
        >
          {/* 60% Width Card: Bar Chart */}
          <div style={{ flex: "0 0 100%", minWidth: 300 }}>
            <Card
              title="Asset Typewise Count"
              bordered={false}
              style={{
                height: 420,
                borderRadius: 16,
                border: "1px solid #d9d9d9",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                padding: 24,

              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={assetTypeData}
                  margin={{ top: 16, right: 30, left: 0, bottom: 80 }}
                >
                  <XAxis
                    dataKey="type"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    tick={{ fontSize: 10, fontWeight: 400 }} // Reduce font size and weight
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="count" fill="#FFD586" name="Asset Count">
                    <LabelList dataKey="count" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>


          {/* 40% Width Card: Pie Chart */}
          <div style={{ flex: "0 0 100%", minWidth: 300 }}>
            <Card
              title="Asset Statuswise Count"
              bordered={false}
              style={{
                height: 420,
                borderRadius: 16,
                border: "1px solid #d9d9d9",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                padding: 24,
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={statusData}
                  layout="vertical"
                  margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                >
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{
                      width: 100,               // Set width for labels
                      overflow: "visible",     // Allow overflow if needed
                      textOverflow: "ellipsis" // Ellipsis for long names
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    label={{ position: 'right', fill: '#000', fontSize: 14 }}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

          </div>
        </div>

        {/* asset region wise */}
        <Row style={{ marginTop: 32 }}>
          <Col span={24}>
            <Card title="Asset Region Summary" bordered={false}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={assetregionData}
                  layout="vertical"
                  margin={{ top: 20, right: 50, left: 100, bottom: 20 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="region" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#FF9898"
                    name="Asset Count"
                    label={{ position: "right", fill: "#000", fontSize: 14 }}
                  />
                </BarChart>
              </ResponsiveContainer>


            </Card>
          </Col>
        </Row>
        {/* asset region wise */}

        {/* for asset */}
      </div>
      {/* for priority */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="lowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>

          <linearGradient id="mediumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>

          <linearGradient id="highGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#fca5a5" />
          </linearGradient>
        </defs>
      </svg>



    {/* </Spin> */}
     <Footer/>
     </>
      )}
    </>
  );

};

export default Dashboard;
