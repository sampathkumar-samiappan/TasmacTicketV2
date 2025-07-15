
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from "../Footer/Footer";
import { BASE_URL, HEADERS } from "../API Config/config";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  message,
  Select, 
  Tooltip,
  List,
  Typography,
  Breadcrumb,
} from 'antd';
import { DownloadOutlined, EditOutlined, ClockCircleTwoTone, HomeOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import historyIcon from '../../assets/images/history.png';
import nodata from '../../assets/images/no-data.gif';
import Swal from 'sweetalert2';

const { Text } = Typography;

const FaultyAsset = () => {
  const [assets, setAssets] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logData, setLogData] = useState([]);
  const [form] = Form.useForm();

  const columnsMeta = [
    { title: 'Asset Category', dataIndex: 'assets_category' },
    { title: 'Asset Type', dataIndex: 'asset_type' },
    { title: 'Serial Number', dataIndex: 'serial_number' },
    { title: 'Make', dataIndex: 'make' },
    { title: 'Model', dataIndex: 'model' },
    { title: 'Office Category', dataIndex: 'office_category' },
    { title: 'Region', dataIndex: 'region' },
    { title: 'DM', dataIndex: 'dm' },
    { title: 'Depot', dataIndex: 'depot' },
    { title: 'Shop Number', dataIndex: 'shop_number' },
    { title: 'Modified Date', dataIndex: 'modified' },
    { title: 'User Type', dataIndex: 'usertype', render: (text) => text || 'N/A' }
  ];

  useEffect(() => {
    fetchFaultyAssets();
  }, []);

  const fetchFaultyAssets = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("userData"));
      const usertype = user?.user_type || 'Admin';

      const response = await axios.get(`${BASE_URL}/api/method/get_assets_by_user`, {
        headers: HEADERS,
        params: { usertype, status: 'Faulty', page: 1, page_length: 100 }
      });

      const data = response?.data?.message?.assets || [];
      setAssets(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching faulty assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value, dataIndex) => {
    const newFilters = { ...filters, [dataIndex]: value };
    setFilters(newFilters);
    const filtered = assets.filter((item) =>
      Object.entries(newFilters).every(([key, val]) =>
        item[key]?.toString().toLowerCase().includes(val.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FaultyAssets");
    XLSX.writeFile(workbook, "FaultyAssets.xlsx");
  };

  const handleEdit = (record) => {
    setSelectedAsset(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // const handleUpdate = async () => {
  //   try {
  //     const values = await form.validateFields();
  //     const assetId = selectedAsset.name;
  //       const username = JSON.parse(localStorage.getItem("userData"))?.username || "Unknown";
  //       const user_id = JSON.parse(localStorage.getItem("userData"))?.user_id || "Unknown";
  //     await axios.put(`${BASE_URL}/api/resource/Asset/${assetId}`, values, { headers: HEADERS });
  //     message.success('Asset updated successfully');
  //     setIsModalVisible(false);
  //     fetchFaultyAssets();
  //   } catch (err) {
  //     console.error(err);
  //     message.error('Failed to update asset');
  //   }
  // };

  const handleUpdate = async () => {
    try {
      // 1. Validate form fields
      const values = await form.validateFields();
      const assetId = selectedAsset.name;
  
      // 2. Get user info
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      const username = userData.username || "Unknown";
      const user_id = userData.user_id || "Unknown";
  
      // 3. Update asset
      await axios.put(`${BASE_URL}/api/resource/Asset/${assetId}`, values, {
        headers: HEADERS,
      });
  
      // 4. Prepare log values
      const action_type = "Updated";
      const remarks = values.remarks || selectedAsset.remarks || "Asset updated successfully";
      const status = values.status || "Active";
  
      console.log("📤 Logging to AssetLog with:", {
        asset_id: assetId,
        user_id,
        username,
        action_type,
        remarks,
        status,
      });
  
      // 5. Log to AssetLog Doctype
      const logResponse = await fetch(`${BASE_URL}/api/method/log_asset_action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...HEADERS,
        },
        body: JSON.stringify({
          asset_id: assetId,
          user_id,
          username,
          action_type,
          remarks,
          status,
        }),
      });
  
      const logResult = await logResponse.json();
      console.log("📦 AssetLog API Response:", logResult);
  
      if (!logResponse.ok) {
        console.error("❌ Asset log failed:", logResult.message || "Unknown error");
      }
  
      // 6. Show success message
      await Swal.fire({
        icon: "success",
        title: "Asset updated successfully!",
        showConfirmButton: false,
        timer: 2000,
      });
  
      // 7. Final steps
      setIsModalVisible(false);
      fetchFaultyAssets();
  
    } catch (err) {
      console.error("❌ Error updating asset:", err);
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Something went wrong!",
      });
    }
  };
  


    const fetchAssetLogs = async (assetId) => {
      if (!assetId) return;
    
      try {
        const response = await fetch(
          `${BASE_URL}/api/resource/AssetLog?fields=["*"]&filters=[["asset_id","=","${assetId}"]]`,
          {
            headers: {
              "Content-Type": "application/json",
              ...HEADERS,
            },
          }
        );
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setLogData(data.data);
          setSelectedAssetId(assetId);
          console.log(data.data );

          setLogModalVisible(true);
        } else {
          setLogData([]);
          setSelectedAssetId(assetId);
          setLogModalVisible(true);
        }
      } catch (error) {
        console.error("Failed to fetch asset logs:", error);
      }
    };
    

  const columns = [
    ...columnsMeta.map(({ title, dataIndex }) => ({
      title: (
        <div>
          <div style={{ fontWeight: 500, marginBottom: "8px" }}>{title}</div>
          <Input
            size="small"
            placeholder="Search"
            value={filters[dataIndex] || ''}
            onChange={(e) => handleFilterChange(e.target.value, dataIndex)}
          />
        </div>
      ),
      dataIndex,
      key: dataIndex,
      sorter: (a, b) => a[dataIndex]?.toString().localeCompare(b[dataIndex]?.toString())
    })),
    {
      title: 'History',
      key: 'history',
      width: 60,
      render: (_, record) => (
        <Tooltip title="View History">
          <img
            src={historyIcon}
            alt="History"
            style={{ cursor: 'pointer', width: 20, height: 20 }}
            onClick={() => fetchAssetLogs(record.name)}
          />
        </Tooltip>
      )
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
          type="link"
        />
      )
    }
  ];

  return (
      <>
    <div style={{ padding: 24 }}>
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, paddingBottom: 8 }}>
        {/* <h2 style={{ margin: 0 }}>Faulty Assets</h2> */}
          <Breadcrumb
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
                    title: <a href="">Faulty Asset</a>,
                  }
                ]}
              />
        <div style={{ textAlign: 'right', marginTop:4}}>
          <Button style={{ textAlign: 'right'}} type="primary" icon={<DownloadOutlined />} onClick={exportToExcel}>
            Export to Excel
          </Button>
        </div>
      </div>

      <div style={{ maxHeight: '500px', overflowY: 'auto', marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          className="custom-table"
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey={(record, index) => record.name || index}
          bordered
          scroll={{ x: 'max-content' }}
        />
      </div>

      <Modal
        title="Edit Asset"
        open={isModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsModalVisible(false)}
        okText="Update"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="asset_type" label="Asset Type" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="serial_number" label="Serial Number" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="make" label="Make"><Input /></Form.Item>
          <Form.Item name="model" label="Model"><Input /></Form.Item>
          <Form.Item name="region" label="Region"><Input /></Form.Item>
          <Form.Item name="dm" label="DM"><Input /></Form.Item>
          <Form.Item name="depot" label="Depot"><Input /></Form.Item>
          <Form.Item name="shop_number" label="Shop Number"><Input /></Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Faulty">Faulty</Select.Option>
              <Select.Option value="Replacement">Replacement</Select.Option>
            </Select>
          </Form.Item>
                    <Form.Item name="remarks" label="remarks"><Input /></Form.Item>
          
        </Form>
      </Modal>

      <Modal
        title={`Asset Logs - ${selectedAssetId}`}
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        footer={null}
        width={700}
      >
        {logData.length > 0 ? (
          <List
            bordered
            dataSource={logData}
            style={{ maxHeight: 300, overflowY: 'auto' }}
            renderItem={(log, index) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <Text strong>{index + 1}.</Text>{' '}
                  <Text style={{ color: '#025E73' }}>{(log.username || 'Unknown').toUpperCase()}</Text>{' '}performed{' '}
                  <Text strong style={{ color: '#fa541c' }}>{log.action_type}</Text>{' '}on Asset ID{' '}
                  <Text code>{selectedAssetId}</Text>.<br />
                  Status: <Text strong style={{ color: '#52c41a' }}>{log.status}</Text><br />
                  Remark: <Text style={{ color: '#025E73' }}>{(log.remarks || '—').toUpperCase()}</Text><br />
                  <Text type="secondary">
                    <ClockCircleTwoTone twoToneColor="#52c41a" />{' '}
                    <Text style={{ color: '#F2A71B' }}>{log.datetime ? new Date(log.datetime).toLocaleString() : 'No timestamp'}</Text>
                  </Text>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text type="secondary">No History Available.</Text><br />
            <img style={{ height: '150px', width: '150px', marginTop: '10px' }} src={nodata} alt="No Data" />
          </div>
        )}
      </Modal>
    </div>
    <Footer/>
  
    </>
  );
};

export default FaultyAsset;
