
import React, { useEffect, useState } from 'react';
import { Table, Input, Modal, Button, Form, message, Popconfirm, Select, Tooltip, List, Typography, Breadcrumb } from 'antd';
import { EditOutlined, DeleteOutlined, ClockCircleTwoTone, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { BASE_URL, HEADERS } from '../API Config/config';
import nodata from '../../assets/images/no-data.gif';
import history from '../../assets/images/history.png';
import Swal from 'sweetalert2';
import Footer from "../Footer/Footer";

const { Text } = Typography;

const ReplacementAsset = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logData, setLogData] = useState([]);

  const columnsMeta = [
    { title: 'Asset Category', dataIndex: 'assets_category' },
    { title: 'Asset Type', dataIndex: 'asset_type' },
    { title: 'Old Serial Number', dataIndex: 'serial_number' },
    { title: 'New Serial Number', dataIndex: 'new_serial_number' },
    { title: 'Make', dataIndex: 'make' },
    { title: 'Model', dataIndex: 'model' },
    { title: 'Office Category', dataIndex: 'office_category' },
    { title: 'Region', dataIndex: 'region' },
    { title: 'DM', dataIndex: 'dm' },
    { title: 'Depot', dataIndex: 'depot' },
    { title: 'Shop Number', dataIndex: 'shop_number' },
    { title: 'Modified Date', dataIndex: 'modified' },
    { title: 'User Type', dataIndex: 'usertype', render: (text) => text || 'N/A' },
  ];

  useEffect(() => {
    fetchReplacementAssets();
  }, []);

  const fetchReplacementAssets = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("userData"));
      const usertype = user?.user_type || 'Admin';

      const response = await axios.get(`${BASE_URL}/api/method/get_assets_by_user`, {
        headers: HEADERS,
        params: {
          usertype,
          status: 'Replacement',
          page: 1,
          page_length: 100,
        },
      });

      const data = response?.data?.message?.assets || [];
      setAssets(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching replacement assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value, dataIndex) => {
    const newFilters = { ...filters, [dataIndex]: value };
    setFilters(newFilters);
    const filtered = assets.filter((item) =>
      Object.entries(newFilters).every(([key, val]) =>
        item[key]?.toString().toLowerCase().includes(val.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      // 1. Validate form values
      const values = await form.validateFields();

      // 2. Update Asset
      await axios.put(`${BASE_URL}/api/resource/Asset/${editingRecord.name}`, values, {
        headers: HEADERS,
      });

      // 3. Prepare log details
      const asset_id = editingRecord.name;
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      const username = userData.username || "Unknown";
      const user_id = userData.user_id || "Unknown";
      const action_type = "Updated";
      const remarks = values.remarks || editingRecord.remarks || "Asset updated by user";
      const status = values.status || "Active";

      console.log("📤 Logging to AssetLog with:", {
        asset_id,
        user_id,
        username,
        action_type,
        remarks,
        status,
      });

      // 4. Log to custom API
      const logResponse = await fetch(`${BASE_URL}/api/method/log_asset_action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...HEADERS,
        },
        body: JSON.stringify({
          asset_id,
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

      // 5. Success Message
      await Swal.fire({
        icon: "success",
        title: "Asset updated successfully!",
        showConfirmButton: false,
        timer: 2000,
      });

      // 6. Final Steps
      setIsModalVisible(false);
      fetchReplacementAssets();
      fetchAssetLogs(editingRecord.name);

    } catch (error) {
      console.error("❌ Error updating asset or creating log:", error);
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Something went wrong!",
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
        console.log(data.data);

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


  const handleDelete = async (name) => {
    try {
      await axios.delete(`${BASE_URL}/api/resource/Asset/${name}`, {
        headers: HEADERS,
      });
      message.success('Asset deleted successfully');
      fetchReplacementAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      message.error('Failed to delete asset');
    }
  };

  const columns = [
    ...columnsMeta.map(({ title, dataIndex }) => ({
      title: (
        <div>
          <div style={{ marginBottom: "10px" }}>{title}</div>
          <Input
            placeholder="Search"
            size="small"
            value={filters[dataIndex] || ''}
            onChange={(e) => handleSearchChange(e.target.value, dataIndex)}
          />
        </div>
      ),
      dataIndex,
      key: dataIndex,
      sorter: (a, b) => a[dataIndex]?.toString().localeCompare(b[dataIndex]?.toString()),
    })),

    {
      title: 'Asset History',
      dataIndex: 'actions',
      render: (_, record) => (
        <Tooltip title="View History">
          <img
            style={{ height: "20px", width: "20px", cursor: "pointer" }}
            src={history} // Make sure `history` image is imported
            alt="History"
            onClick={() => {
              setSelectedAssetId(record.name);
              setLogModalVisible(true);
              fetchAssetLogs(record.name);
            }}
          />
        </Tooltip>
      ),
    },

    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} type="link" />
          <Popconfirm
            title="Are you sure to delete this asset?"
            onConfirm={() => handleDelete(record.name)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="link" danger />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
    <div style={{ padding: 24 }}>
      {/* <h2>Replacement Assets</h2> */}
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
            title: <a href="">Replacement Asset</a>,
          }
        ]}
      />
      <Table
        className="custom-table"
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => record.name}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
        size="middle"
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title="Edit Asset"
        open={isModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsModalVisible(false)}
        okText="Update"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="asset_type" label="Asset Type"><Input /></Form.Item>
          <Form.Item name="serial_number" label="Old Serial Number"><Input /></Form.Item>
          <Form.Item name="new_serial_number" label="New Serial Number"><Input /></Form.Item>
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
                  <Text strong>{index + 1}.</Text> <Text style={{ color: '#025E73' }}>{(log.username || 'Unknown').toUpperCase()}</Text> performed
                  <Text strong style={{ color: '#fa541c' }}> {log.action_type}</Text> on Asset ID <Text code>{selectedAssetId}</Text>.<br />
                  Status: <Text strong style={{ color: '#52c41a' }}>{log.status}</Text><br />
                  Remark: <Text style={{ color: '#025E73' }}>{(log.remarks || '—').toUpperCase()}</Text><br />
                  <Text type="secondary">
                    <ClockCircleTwoTone twoToneColor="#52c41a" /> <Text style={{ color: '#F2A71B' }}>{log.datetime ? new Date(log.datetime).toLocaleString() : 'No timestamp'}</Text>
                  </Text>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text type="secondary">No History Available.</Text>
          </div>
        )}
      </Modal>
    </div>
    <Footer/>
    
    </>
  );
};

export default ReplacementAsset;
