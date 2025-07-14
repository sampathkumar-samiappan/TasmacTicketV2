import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Modal,
  Button,
  Form,
  message,
  Popconfirm,
  Select,
  Tooltip,
  List,
  Typography,
  Breadcrumb,
} from 'antd';
import { EditOutlined, DeleteOutlined , HomeOutlined} from '@ant-design/icons';
import { BASE_URL, HEADERS } from '../API Config/config';
import Swal from 'sweetalert2';
import { ClockCircleTwoTone } from '@ant-design/icons';
// import history from '../assets/history.png';
 import axios from 'axios';
import history from '../../assets/images/history.png';
import nodata from '../../assets/images/no-data.gif';
const { Text } = Typography;

const ScrapAsset = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [logData, setLogData] = useState([]);
  const [form] = Form.useForm();

  const fetchScrapAssets = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("userData"));
      const usertype = user?.user_type || '';

      const response = await axios.get(`${BASE_URL}/api/method/get_assets_by_user`, {
        headers: HEADERS,
        params: {
          usertype,
          status: 'Scrap',
          page: 1,
          page_length: 100,
        },
      });

      const data = response?.data?.message?.assets || [];
      setAssets(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching scrap assets:', error);
      message.error('Failed to fetch scrap assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScrapAssets();
  }, []);

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
      const values = await form.validateFields();
      await axios.put(`${BASE_URL}/api/resource/Asset/${editingRecord.name}`, values, {
        headers: HEADERS,
      });

      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      const asset_id = editingRecord.name;
      const username = userData.username || "Unknown";
      const user_id = userData.user_id || "Unknown";
      const action_type = "Updated";
      const remarks = values.remarks || editingRecord.remarks || "Asset updated by user";
      const status = values.status || "Scrap";

      const logResponse = await fetch(`${BASE_URL}/api/method/log_asset_action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...HEADERS,
        },
        body: JSON.stringify({ asset_id, user_id, username, action_type, remarks, status }),
      });

      const logResult = await logResponse.json();
      if (!logResponse.ok) {
        console.error("Asset logging failed:", logResult.message || "Unknown error");
      }

      await Swal.fire({
        icon: "success",
        title: "Asset updated successfully!",
        showConfirmButton: false,
        timer: 2000,
      });

      setIsModalVisible(false);
      fetchScrapAssets();
      fetchAssetLogs(asset_id);
    } catch (error) {
      console.error("Error updating or logging asset:", error);
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

  const handleDelete = async (name) => {
    try {
      await axios.delete(`${BASE_URL}/api/resource/Asset/${name}`, {
        headers: HEADERS,
      });
      message.success('Asset deleted successfully');
      fetchScrapAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      message.error('Failed to delete asset');
    }
  };

  const columns = [
    ...[
      'assets_category', 'asset_type', 'serial_number', 'make', 'model',
      'office_category', 'region', 'dm', 'depot', 'shop_number',
      'modified', 'usertype', 'status', 'remarks'
    ].map((dataIndex) => ({
      title: (
        <div>
          <div style={{ marginBottom: "10px", fontWeight: 500 }}>{dataIndex.replace(/_/g, ' ')}</div>
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
    {
      title: 'Asset History',
      dataIndex: 'actions',
      render: (_, record) => (
        <Tooltip title="View History">
          <img
            style={{ height: "20px", width: "20px", cursor: "pointer" }}
            src={history}
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
  ];

  return (
    <div style={{ width: "1250px", overflowX: "auto" }}>
      {/* <h2>Scrap Assets</h2> */}
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
                  title: <a href="">Scrap Assets</a>,
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
          <Form.Item name="serial_number" label="Serial Number"><Input /></Form.Item>
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
              <Select.Option value="MoveScrap">MoveScrap</Select.Option>
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
  );
};

export default ScrapAsset;