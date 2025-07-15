import React, { useState, useEffect } from 'react';
import { Popconfirm } from 'antd';
import BackToTopButton from '../BackToTop/BackToTopButton';
import {
  Table,
  Modal,
  Button,
  Form,
  Input,
  Select,
  Tabs,
  Pagination,
  Drawer, Tooltip,
  message, List, Typography, Flex, AutoComplete, Breadcrumb
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined, ClockCircleTwoTone, HomeOutlined
} from '@ant-design/icons';
import nodata from '../../assets/images/no-data.gif';
import history from '../../assets/images/history.png';
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from 'sweetalert2';

import { HEADERS, URL_AssetDetails, URL_AssetTypes, URL_AssetCategories, API_URL, BASE_URL } from '../API Config/config';
import "./asset.css"
const { TabPane } = Tabs;
const { Option } = Select;

function Asset() {
  const [form] = Form.useForm();
  const [selectedForm, setSelectedForm] = useState('');
  const [view, setView] = useState('asset');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [assetData, setAssetData] = useState([]);
  const [assetTypeData, setAssetTypeData] = useState([]);
  const [assetCategoryData, setAssetCategoryData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 100 });
  const [selectedCategoryName, setSelectedCategoryName] = useState(null); // internal value like "CT0001"
  const [searchText, setSearchText] = useState({});
  const [officeCategoryData, setOfficeCategoryData] = React.useState([]);
  const [assetsCategoryData, setAssetsCategoryData] = React.useState([]);
  const [officeData, setOfficeData] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [status, setStatus] = useState('Active'); // default
  const [assetTypeList, setAssetTypeList] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [offices, setOffices] = useState([]);

  const [officeCategory, setOfficeCategory] = useState('');
  const [regionList, setRegionList] = useState([]);
  const [region, setRegion] = useState('');

  const [dmList, setDmList] = useState([]);
  const [dm, setDm] = useState('');

  const [depotList, setDepotList] = useState([]);
  const [depot, setDepot] = useState('');

  const [shopNumber, setShopNumber] = useState('');

  const [shopNumberList, setShopNumberList] = useState([]);
  const [assetlgs, setAssetLogs] = useState([]);

  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logData, setLogData] = useState([]);
  const { Text } = Typography;


  useEffect(() => {
    // fetchAssets();
    fetchAssetType();
    fetchAssetCategory();
    fetchOffice();
    //logAssetAction();
    fetchAssetLogs();
  }, []);

  // useEffect(() => {
  //   fetchAssets(pagination.current, pagination.pageSize);
  // }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (view === 'asset') {
      fetchAssets(pagination.current, pagination.pageSize);
    } else if (view === 'assetType') {
      fetchAssetType();
    } else {
      fetchAssetCategory();
    }
  }, [view, pagination.current, pagination.pageSize]);




  // const fetchAssets = async () => {
  //     try {
  //         const response = await fetch(
  //             "https://ahms.tasmace2e.in/api/resource/Asset?fields=[%22*%22]",  // <-- use backticks here
  //             { method: 'GET', headers: HEADERS }
  //         );
  //         const jsonData = await response.json();
  //         setAssetData(jsonData.data);
  //     } catch (error) {
  //         console.error('Fetch assets error:', error);
  //     }
  // };
  // const logAssetAction = async (assetId, remarks, status) => {
  //   const user = JSON.parse(localStorage.getItem("user")); // ✅ get user from storage
  //   if (!user || !user.username) {
  //     console.error("User not found or not logged in");
  //     return;
  //   }

  //   try {
  //     const params = new URLSearchParams({
  //       asset_id: assetId,
  //       username: user.username,
  //       remarks: remarks,
  //       status: status,
  //       action_type: "Updated"
  //     });

  //     const response = await fetch(`${BASE_URL}/api/method/log_asset_action?${params}`, {
  //       method: "POST",
  //       headers: HEADERS
  //     });

  //     const data = await response.json();
  //     console.log("Log created:", data.message);
  //   } catch (error) {
  //     console.error("Failed to log asset action", error);
  //   }
  // };




  const fetchAssets = async (currentPage = 1, pageSize = 20) => {
    try {
      const user = JSON.parse(localStorage.getItem("userData"));

      if (!user || !user.user_type) {
        console.error("User data missing from localStorage");
        return;
      }

      const { user_type, region, dm, depot, shop_number } = user;
      const params = new URLSearchParams();

      params.append("usertype", user_type);
      params.append("page", currentPage);
      params.append("page_length", pageSize);

      if (
        user_type === "Support Team" ||
        user_type === " Admin" ||


        user_type === "Region Admin"
      ) {
        if (region) params.append("region", region);
      } else if (user_type === "Dm Admin") {
        if (dm) params.append("dm", dm);
      } else if (user_type === "Depot Admin" || user_type === "Service Engineer") {
        if (depot) params.append("depot", depot);
      }
      else if (user_type === "RvShop Admin") {
        if (shop_number) params.append("shop_number", shop_number);
      }

      const url = `${BASE_URL}/api/method/get_assets_by_user?${params.toString()}`;
      console.log("Final API URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: HEADERS,
      });

      const jsonData = await response.json();
      console.log("Full API Response:", JSON.stringify(jsonData, null, 2));

      const assets = jsonData.message?.assets || jsonData.assets || [];

      if (Array.isArray(assets)) {
        // ✅ Filter to show only active assets
        const activeAssets = assets.filter(asset => asset.status === "Active");

        setAssetData(activeAssets);

        // Set pagination total if provided
        if (jsonData.message?.total_count) {
          setPagination((prev) => ({ ...prev, total: jsonData.message.total_count }));
        }
      } else {
        console.error("Unexpected format for assets:", assets);
        setAssetData([]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
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


  const fetchOffice = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/resource/office?fields=[%22*%22]&limit=10000`,
        { method: 'GET', headers: HEADERS }
      );
      const jsonData = await response.json();
      setOfficeData(jsonData.data);  // <-- corrected here
    } catch (error) {
      console.error('Fetch office error:', error);
    }
  };
  const fetchAssetType = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/resource/Asset%20Type?fields=["*"]`,
        { method: 'GET', headers: HEADERS }
      );
      const jsonData = await response.json();
      const data = jsonData.data || [];
      setAssetTypeData(data);
      setPagination((prev) => ({ ...prev, total: data.length }));
    } catch (error) {
      console.error('Fetch asset type error:', error);
    }
  };


  const fetchAssetCategory = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/resource/Assets%20Category?fields=["*"]`,
        { method: 'GET', headers: HEADERS }
      );
      const jsonData = await response.json();
      const data = jsonData.data || [];
      setAssetCategoryData(data);
      setPagination((prev) => ({ ...prev, total: data.length }));
    } catch (error) {
      console.error('Fetch asset category error:', error);
    }
  };


  const showModal = (formType, item = null) => {
    setSelectedForm(formType);
    setEditItem(item);
    setIsEditMode(!!item);
    if (item) form.setFieldsValue(item);
    else form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setIsEditMode(false);
  };


  useEffect(() => {
    const filtered = officeData.filter(item => item.office_category === officeCategory);
    const uniqueRegions = [...new Set(filtered.map(item => item.region))];
    setRegionList(uniqueRegions);
    setRegion('');
    setDm('');
    setDepot('');
    setShopNumber('');
  }, [officeCategory]);

  useEffect(() => {
    const filtered = officeData.filter(item =>
      item.office_category === officeCategory && item.region === region
    );
    const uniqueDMs = [...new Set(filtered.map(item => item.dm))];
    setDmList(uniqueDMs);
    setDm('');
    setDepot('');
    setShopNumber('');
  }, [region]);

  useEffect(() => {
    const filtered = officeData.filter(item =>
      item.office_category === officeCategory && item.region === region && item.dm === dm
    );
    const uniqueDepots = [...new Set(filtered.map(item => item.depot))];
    setDepotList(uniqueDepots);
    setDepot('');
    setShopNumber('');
  }, [dm]);

  // Filter Shop Numbers if RV Shop is selected
  useEffect(() => {
    if (officeCategory === 'RV SHOP') {
      const filtered = officeData.filter(item =>
        item.office_category === officeCategory &&
        item.region === region &&
        item.dm === dm &&
        item.depot === depot
      );
      const uniqueShops = [...new Set(filtered.map(item => item.shop_number))];
      setShopNumberList(uniqueShops);
      setShopNumber('');
    }
  }, [depot]);


  useEffect(() => {
    if (selectedCategory) {
      const filtered = assetTypeData.filter(
        (item) =>
          item.assets_category?.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase()
      );
      const uniqueTypes = [
        ...new Set(filtered.map((item) => item.asset_type?.trim()))
      ];
      setAssetTypeList(uniqueTypes);
      console.log('Filtered asset types:', uniqueTypes);
    } else {
      setAssetTypeList([]);
    }
  }, [selectedCategory, assetTypeData]);



  const handleOk = async () => {
    try {
      // 1. Validate form fields
      const values = await form.validateFields();
      console.log("✅ Submitting values:", values);

      // 2. Default status if creating
      if (!isEditMode) {
        values.status = 'Active';
      }

      // 3. Determine API endpoint based on form type
      const isType = selectedForm === 'assetType';
      const isCategory = selectedForm === 'assetCategory';

      const url = isEditMode
        ? `${BASE_URL}/api/resource/${isType ? 'Asset Type' : isCategory ? 'Assets Category' : 'Asset'}/${encodeURIComponent(editItem.name)}`
        : `${BASE_URL}/api/resource/${isType ? 'Asset Type' : isCategory ? 'Assets Category' : 'Asset'}`;

      const method = isEditMode ? 'PUT' : 'POST';

      // 4. Save data to Frappe
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...HEADERS,
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      console.log("✅ Save result:", result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save');
      }

      // 5. Prepare data for logging
      const asset_id = result?.data?.name || editItem?.name || values?.name;
      const username = JSON.parse(localStorage.getItem("userData"))?.username || "Unknown";
      const user_id = JSON.parse(localStorage.getItem("userData"))?.user_id || "Unknown";

      const action_type = isEditMode ? "Updated" : "Created";
      // const remarks = isEditMode ? "Asset updated successfully" : "Asset created successfully";
      const remarks = result?.data?.remarks || editItem?.remarks || values?.remarks;
      const status = values.status || "Active";

      console.log("📤 Logging to AssetLog with:", {
        asset_id,
        user_id,
        username,
        action_type,
        remarks,
        status,
      });

      // 6. Log to AssetLog Doctype
      const logResponse = await fetch(`${BASE_URL}/api/method/log_asset_action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...HEADERS,
        },
        body: JSON.stringify({ asset_id, user_id, username, action_type, remarks, status }),
      });

      try {
        const logResult = await logResponse.json();
        console.log("📦 AssetLog API Response:", JSON.stringify(logResult, null, 2));

        if (!logResponse.ok) {
          console.error("❌ Asset log failed:", logResult.error || "Unknown error");
        }
      } catch (e) {
        console.error("❌ Failed to parse AssetLog response JSON:", e);
      }

      // 7. Show success message
      await Swal.fire({
        icon: 'success',
        title: `${selectedForm} ${isEditMode ? 'updated' : 'submitted'} successfully!`,
        showConfirmButton: false,
        timer: 2000,
      });

      // 8. Final steps: close modal, refresh data
      handleCancel();
      fetchAssets();
      fetchAssetType();
      fetchAssetCategory();

    } catch (error) {
      console.error("❌ Error during save:", error);

      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.message || 'Something went wrong!',
      });
    }
  };



  const handleDelete = async (name, viewType) => {
    console.log('Deleting:', name, 'Type:', viewType);

    const encodedName = encodeURIComponent(name);

    const resourceName =
      viewType === 'assetType' ? 'Asset Type' :
        viewType === 'assetCategory' ? 'Assets Category' :
          viewType === 'asset' ? 'Asset' :
            null;

    if (!resourceName) {
      console.warn('Unknown viewType for delete:', viewType);
      return;
    }

    const url = `${BASE_URL}/api/resource/${resourceName}/${encodedName}`;

    let updateState;
    if (viewType === 'asset') {
      updateState = () => setAssetData(prev => prev.filter(item => item.name !== name));
    } else if (viewType === 'assetType') {
      updateState = () => setAssetTypeData(prev => prev.filter(item => item.name !== name));
    } else if (viewType === 'assetCategory') {
      updateState = () => setAssetCategoryData(prev => prev.filter(item => item.name !== name));
    }

    try {
      const result = await Swal.fire({
        title: `Delete ${name}?`,
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: HEADERS,
        });

        if (!response.ok) {
          const errorRes = await response.json().catch(() => ({}));
          throw new Error(errorRes.message || `Failed to delete ${viewType}`);
        }


        updateState();

        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${name} has been deleted.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error(`Delete error for ${viewType}:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error.message || `Failed to delete ${viewType}`
      });
    }
  };


  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
            confirm({ closeDropdown: false });
          }}
          onPressEnter={() => confirm()}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          onClick={() => clearFilters()}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
  });



  useEffect(() => {
    const values = form.getFieldsValue(["supplied_date", "expiry_date"]);
    const { supplied_date, expiry_date } = values;

    if (supplied_date && expiry_date) {
      const start = moment(supplied_date);
      const end = moment(expiry_date);
      const years = end.diff(start, "years", true); // true => decimal support
      const rounded = Math.max(0, years.toFixed(1)); // Avoid negatives
      form.setFieldsValue({ warranty_years: rounded });
    }
  }, [form.getFieldValue("supplied_date"), form.getFieldValue("expiry_date")]);


  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getCurrentData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${view}_data_${new Date().toISOString()}.xlsx`);
  };

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(getCurrentData());
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${view}_data_${new Date().toISOString()}.csv`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const columns = getColumns()
      .filter(col => col.dataIndex)
      .map(col => ({ header: col.title, dataKey: col.dataIndex }));
    const rows = getCurrentData();
    doc.autoTable({
      columns,
      body: rows,
      styles: { fontSize: 8 },
      margin: { top: 10 },
    });
    doc.save(`${view}_data_${new Date().toISOString()}.pdf`);
  };

  const getCurrentData = () => {
    // Get current data based on view
    if (view === "asset") return assetData;
    if (view === "assetType") return assetTypeData;
    if (view === "assetCategory") return assetCategoryData;
    return [];
  };

  // Define separate column configurations
  const assetColumns = [
    {
      title: 'Asset ID',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),

    },
    {
      title: "Actions",
      render: (_, record) => (
        <span style={{ display: 'inline-flex', gap: 8 }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal("asset", record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.name, "asset")}
          />
        </span>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
      ...getColumnSearchProps("status"),
      // render: (text) => (text ? text : <span style={{ color: "#999" }}>No Shop Number</span>),
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
              setSelectedAssetId(record.name);  // you can rename it to match your context
              setLogModalVisible(true);
              fetchAssetLogs(record.name);
            }}
          />
        </Tooltip>
      ),
    },


    {
      title: "Asset Category",
      dataIndex: "assets_category",
      key: "assets_category",
      sorter: (a, b) => a.assets_category.localeCompare(b.assets_category),
      ...getColumnSearchProps("assets_category"),
    },
    {
      title: "Type",
      dataIndex: "asset_type",
      sorter: (a, b) => a.asset_type.localeCompare(b.asset_type),
      ...getColumnSearchProps("asset_type"),
    },
    {
      title: "Serial No",
      dataIndex: "serial_number",
      sorter: (a, b) => a.serial_number.localeCompare(b.serial_number),
      ...getColumnSearchProps("serial_number"),
    },
    // {
    //   title: "New Serial No",
    //   dataIndex: "new_serial_number",
    //   sorter: (a, b) => a.new_serial_number?.localeCompare(b.new_serial_number),
    //   ...getColumnSearchProps("new_serial_number"),
    //   render: (text, record) => (
    //     <span
    //       style={{ color: "#1890ff", cursor: "pointer", textDecoration: "underline" }}
    //       onClick={() => showModal("asset", record)}
    //     >
    //       {text}
    //     </span>
    //   ),
    // },

    {
      title: "Make",
      dataIndex: "make",
      sorter: (a, b) => a.make.localeCompare(b.make),
      ...getColumnSearchProps("make"),
    },
    {
      title: "Model",
      dataIndex: "model",
      sorter: (a, b) => a.model.localeCompare(b.model),
      ...getColumnSearchProps("model"),
    },
    {
      title: "Office Category",
      dataIndex: "office_category",
      sorter: (a, b) => a.office_category?.localeCompare(b.office_category),
      ...getColumnSearchProps("office_category"),
    },
    {
      title: "Region",
      dataIndex: "region",
      sorter: (a, b) => a.region.localeCompare(b.region),
      ...getColumnSearchProps("region"),
    },
    {
      title: "DM",
      dataIndex: "dm",
      sorter: (a, b) => a.dm.localeCompare(b.dm),
      ...getColumnSearchProps("dm"),
    },
    {
      title: "DEPOT",
      dataIndex: "depot",
      sorter: (a, b) => a.depot.localeCompare(b.depot),
      ...getColumnSearchProps("depot"),
    },
    {
      title: "SHOP NUMBER",
      dataIndex: "shop_number",
      sorter: (a, b) => (a.shop_number || "").localeCompare(b.shop_number || ""),
      ...getColumnSearchProps("shop_number"),
      render: (text) => (text ? text : <span style={{ color: "#999" }}>No Shop Number</span>),
    }
  ];

  const assetTypeColumns = [
    {
      title: 'Type Name',
      dataIndex: 'asset_type',
      sorter: (a, b) => a.asset_type.localeCompare(b.asset_type),
      ...getColumnSearchProps("asset_type"),

    },
    {
      title: 'Category',
      dataIndex: 'assets_category',
      sorter: (a, b) => a.asset_type.localeCompare(b.assets_category),
      ...getColumnSearchProps("assets_category"),


    },
    {
      title: 'Actions',
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal('assetType', record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            style={{ marginLeft: 8 }}
            onClick={() => handleDelete(record.name, 'assetType')}
          />
        </span>
      ),
    }


  ];

  const assetCategoryColumns = [
    {
      title: 'Category',
      dataIndex: 'assets_category',
      sorter: (a, b) => a.assets_category.localeCompare(b.assets_category),
      ...getColumnSearchProps("assets_category"),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal('assetCategory', record)}
          />
          <Popconfirm
            title={`Delete ${record.name}?`}
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.name, 'assetCategory')}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              style={{ marginLeft: 8 }}
            />
          </Popconfirm>
        </span>
      ),
    }



  ];

  // Choose columns dynamically based on the selected tab
  const getColumns = () => {
    switch (view) {
      case 'asset':
        return assetColumns;
      case 'assetType':
        return assetTypeColumns;
      case 'assetCategory':
        return assetCategoryColumns;
      default:
        return [];
    }
  };
  const tableContainerStyle = {
    height: 'calc(100vh - 200px)', // Adjust height as needed
    overflowY: 'auto',
    border: '1px solid #f0f0f0',
    padding: '16px',
    background: '#fff',
  };

  return (
    <>
    <div>
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
            title: <a href="">Asset Master</a>,
          }
        ]}
      />
      <Tabs activeKey={view} onChange={(key) => setView(key)}>
        <TabPane tab="Asset Category" key="assetCategory" />
        <TabPane tab="Asset Type" key="assetType" />
        <TabPane tab="Asset" key="asset" />
      </Tabs>




      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal(view)}
        >
          Add {view}
        </Button>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={exportToExcel} style={{ marginTop: 8 }}>
            Export Excel
          </Button>
          <Button onClick={exportToCSV} style={{ marginTop: 8 }}>
            Export CSV
          </Button>
          {/* <Button onClick={exportToPDF} style={{ marginTop: 8 }}>
      Export PDF
    </Button> */}
        </div>
      </div>

      <div style={{ width: "1300px", overflowX: "auto" }}>

        <Table
          rowKey="name"
          columns={getColumns()}
          dataSource={
            view === 'asset'
              ? assetData
              : view === 'assetType'
                ? assetTypeData
                : assetCategoryData
          }
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={(pag) => setPagination(pag)}
        />

      </div>

      <Drawer
        title={`${isEditMode ? 'Edit' : 'Add'} ${view}`}
        open={isModalVisible}
        onClose={handleCancel}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button onClick={handleOk} type="primary">
              {isEditMode ? 'Update' : 'Submit'}
            </Button>
          </div>
        }
        width={500} // Adjust width as needed
      >
        <Form form={form} layout="vertical">
          {view === 'assetCategory' && (
            <Form.Item name="assets_category" label="Category" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          )}
          {view === 'assetType' && (
            <>
              <Form.Item name="asset_type" label="Type Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="assets_category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select Category">
                  {assetCategoryData.map((cat) => (
                    <Option key={cat.name} value={cat.assets_category}>
                      {cat.assets_category}
                    </Option>
                  ))}
                </Select>
              </Form.Item>



            </>
          )}
          {view === 'asset' && (
            <>
              {/* Office Category */}
              <Form.Item
                name="office_category"
                label="Office Category"
                rules={[{ required: true }]}
              >
                <AutoComplete
                  placeholder="Select or Enter Office Category"
                  options={[...new Set(officeData.map(item => item.office_category))].map(cat => ({ value: cat }))}
                  value={officeCategory}
                  onChange={(value) => {
                    setOfficeCategory(value);
                    setRegion('');
                    setDm('');
                    setDepot('');
                    setShopNumber('');
                  }}
                  allowClear
                />
              </Form.Item>

              {/* Region */}
              {officeCategory && (
                <Form.Item
                  name="region"
                  label="Region"
                  rules={[{ required: true }]}
                >
                  <AutoComplete
                    placeholder="Select or Enter Region"
                    options={regionList.map(r => ({ value: r }))}
                    value={region}
                    onChange={(value) => {
                      setRegion(value);
                      setDm('');
                      setDepot('');
                      setShopNumber('');
                    }}
                    allowClear
                  />
                </Form.Item>
              )}

              {/* DM */}
              {region && (
                <Form.Item
                  name="dm"
                  label="DM"
                  rules={[{ required: true }]}
                >
                  <AutoComplete
                    placeholder="Select or Enter DM"
                    options={dmList.map(d => ({ value: d }))}
                    value={dm}
                    onChange={(value) => {
                      setDm(value);
                      setDepot('');
                      setShopNumber('');
                    }}
                    allowClear
                  />
                </Form.Item>
              )}

              {/* Depot */}
              {dm && (
                <Form.Item
                  name="depot"
                  label="Depot"
                  rules={[{ required: true }]}
                >
                  <AutoComplete
                    placeholder="Select or Enter Depot"
                    options={depotList.map(dep => ({ value: dep }))}
                    value={depot}
                    onChange={(value) => {
                      setDepot(value);
                      setShopNumber('');
                    }}
                    allowClear
                  />
                </Form.Item>
              )}

              {/* Shop Number */}
              {officeCategory === 'RV SHOP' && depot && (
                <Form.Item
                  name="shop_number"
                  label="Shop Number"
                  rules={[{ required: true }]}
                >
                  <AutoComplete
                    placeholder="Select or Enter Shop Number"
                    options={shopNumberList.map(sn => ({ value: sn }))}
                    value={shopNumber}
                    onChange={(value) => setShopNumber(value)}
                    allowClear
                  />
                </Form.Item>
              )}

              {/* Asset Category */}
              <Form.Item
                name="assets_category"
                label="Asset Category"
                rules={[{ required: true }]}
              >
                <AutoComplete
                  placeholder="Select or Enter Asset Category"
                  options={assetCategoryData.map((item) => ({
                    value: item.assets_category?.trim()
                  }))}
                  value={selectedCategory}
                  onChange={(value) => {
                    console.log('Selected Category:', value);
                    setSelectedCategory(value);
                  }}
                  allowClear
                />
              </Form.Item>


              {selectedCategory && (
                <Form.Item
                  name="asset_type"
                  label="Asset Type"
                  rules={[{ required: true }]}
                >
                  <AutoComplete
                    placeholder="Select or Enter Asset Type"
                    options={assetTypeList.map(type => ({ value: type }))}
                    allowClear
                  />
                </Form.Item>
              )}

              {/* Make */}
              <Form.Item
                name="make"
                label="Make"
                rules={isEditMode ? [] : [{ required: true }]}
              >
                <AutoComplete
                  placeholder="Enter Make"
                  disabled={isEditMode}
                  allowClear
                />
              </Form.Item>

              {/* Model */}
              <Form.Item
                name="model"
                label="Model"
                rules={isEditMode ? [] : [{ required: true }]}
              >
                <AutoComplete
                  placeholder="Enter Model"
                  disabled={isEditMode}
                  allowClear
                />
              </Form.Item>

              {/* Serial Number */}
              <Form.Item
                name="serial_number"
                label="Serial Number"
                rules={isEditMode ? [] : [{ required: true }]}
              >
                <AutoComplete
                  placeholder="Enter Serial Number"
                  disabled={isEditMode}
                  allowClear
                />
              </Form.Item>

              {/* Supplied Date */}
              <Form.Item
                name="supplied_date"
                label="Supplied Date"
                rules={isEditMode ? [] : [{ required: true }]}
              >
                <Input type="date" disabled={isEditMode} />
              </Form.Item>

              {/* Expiry Date */}
              <Form.Item
                name="expiry_date"
                label="Expiry Date"
                rules={isEditMode ? [] : [{ required: true }]}
              >
                <Input type="date" disabled={isEditMode} />
              </Form.Item>

              {/* Warranty Years */}
              <Form.Item
                name="warranty_years"
                label="Warranty Years"
                rules={isEditMode ? [] : [{ required: false }]}
              >
                <Input disabled={isEditMode} />
              </Form.Item>

              {/* Status */}
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select value={status} onChange={(value) => setStatus(value)}>
                  <Option value="Active">Active</Option>
                  <Option value="Faulty">Faulty</Option>
                  <Option value="Replacement">Replacement</Option>
                  <Option value="Scrap">Move to Scrap</Option>
                </Select>
              </Form.Item>

              {/* New Serial Number if Replacement */}
              {status === 'Replacement' && (
                <Form.Item
                  name="new_serial_number"
                  label="New Serial Number"
                  rules={[{ required: true, message: 'Please enter new serial number' }]}
                >
                  <AutoComplete placeholder="Enter New Serial Number" allowClear />
                </Form.Item>
              )}

              {/* Remarks */}
              <Form.Item
                name="remarks"
                label="Remarks"
                rules={[{ required: true }]}
              >
                <AutoComplete placeholder="Enter Remarks" allowClear />
              </Form.Item>
            </>
          )}

        </Form>
      </Drawer>


      <Flex vertical gap="middle" align="flex-start">
        <Modal
          title={`Asset Logs - ${selectedAssetId}`}
          open={logModalVisible}
          onCancel={() => setLogModalVisible(false)}
          footer={null}
          width={700}
        >
          {logData.length > 0 ? (
            <div
              style={{
                maxHeight: logData.length > 3 ? 300 : "auto",
                overflowY: logData.length > 3 ? "auto" : "visible",
              }}
            >
              <List
                bordered
                dataSource={logData}
                renderItem={(log, index) => (
                  <List.Item>
                    <div style={{ width: "100%" }}>
                      <Text strong>{index + 1}.</Text>{" "}
                      <Text style={{ color: "#025E73" }}>
                        {(log.username || "Unknown").toUpperCase()}
                      </Text>{" "}
                      performed{" "}
                      <Text strong style={{ color: "#fa541c" }}>
                        {log.action_type}
                      </Text>{" "}
                      on Asset ID{" "}
                      <Text code>{selectedAssetId}</Text>
                      .<br />
                      Status:{" "}
                      <Text strong style={{ color: "#52c41a" }}>
                        {log.status}
                      </Text>{" "}
                      <br />
                      Remark:{" "}
                      <Text style={{ color: "#025E73" }}>
                        {(log.remarks || "—").toUpperCase()}
                      </Text>
                      <br />
                      <Text type="secondary">
                        <ClockCircleTwoTone twoToneColor="#52c41a" />{" "}
                        <Text style={{ color: "#F2A71B" }}>
                          {log.datetime
                            ? new Date(log.datetime).toLocaleString()
                            : "No timestamp"}
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
            </div>)}
        </Modal>
      </Flex>
    </div>

<BackToTopButton />
 </>
  );

}




export default Asset;
