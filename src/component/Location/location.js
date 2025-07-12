import { Tabs, Table, Button, Drawer, Form, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL, HEADERS } from "../API Config/config"

const { TabPane } = Tabs;
const { Option } = Select;

const RegionManagement = () => {
  const [view, setView] = useState('region');
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pagination, setPagination] = useState({ pageSize: 5 });

  const [regionData, setRegionData] = useState([]);
  const [subRegionData, setSubRegionData] = useState([]);
  const [locationData, setLocationData] = useState([]);

  // Simulated API call examples:
const fetchData = async () => {
  try {
    const [regions, subregions, locations] = await Promise.all([
      axios.get(`${API_URL}/Region?fields=["name","region_name"]`, { headers: HEADERS }),
      axios.get(`${API_URL}/SubRegion?fields=["name","region_name","subregion_name"]`, { headers: HEADERS }),
      axios.get(`${API_URL}/Locations?fields=["name","region_name","subregion_name","location_name"]`, { headers: HEADERS })
    ]);

    setRegionData(regions.data.data);
    setSubRegionData(subregions.data.data);
    setLocationData(locations.data.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

const getColumns = () => {
  const baseCols = [];

  if (view === 'region') {
    baseCols.push({ title: 'Region', dataIndex: 'region_name' });
  } else if (view === 'subregion') {
    baseCols.push(
      { title: 'Region', dataIndex: 'region_name' },
      { title: 'SubRegion', dataIndex: 'subregion_name' }
    );
  } else {
    baseCols.push(
      { title: 'Region', dataIndex: 'region_name' },
      { title: 'SubRegion', dataIndex: 'subregion_name' },
      { title: 'Location', dataIndex: 'location_name' }
    );
  }

  baseCols.push({
    title: 'Action',
    render: (_, record) => (
      <>
        <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
        <Button type="link" danger onClick={() => handleDelete(record)}>Delete</Button>
      </>
    )
  });

  return baseCols;
};

const handleEdit = (record) => {
  setIsEditMode(true);
  setIsModalVisible(true);

  if (view === 'region') {
    form.setFieldsValue({ name: record.region_name });
  } else if (view === 'subregion') {
    form.setFieldsValue({
      name: record.subregion_name,
      region_name: record.region_name
    });
  } else if (view === 'location') {
    form.setFieldsValue({
      name: record.location_name,
      region_name: record.region_name,
      subregion_name: record.subregion_name
    });
  }

  form.setFieldsValue({ docname: record.name }); // Hidden identifier for updating
};


  const showModal = () => {
    form.resetFields();
    setIsEditMode(false);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

const handleOk = async () => {
  try {
    const values = await form.validateFields();
    let url = '';
    let data = {};
    const docname = values.docname;

    if (view === 'region') {
      data = { region_name: values.name };
      url = `${API_URL}/Region${isEditMode ? '/' + docname : ''}`;
    } else if (view === 'subregion') {
      data = {
        region_name: values.region_name,
        subregion_name: values.name
      };
      url = `${API_URL}/SubRegion${isEditMode ? '/' + docname : ''}`;
    } else if (view === 'location') {
      data = {
        region_name: values.region_name,
        subregion_name: values.subregion_name,
        location_name: values.name
      };
      url = `${API_URL}/Locations${isEditMode ? '/' + docname : ''}`;
    }

    if (isEditMode) {
      await axios.put(url, data, { headers: HEADERS });
    } else {
      await axios.post(url, data, { headers: HEADERS });
    }

    setIsModalVisible(false);
    fetchData();
  } catch (err) {
    console.error("Submission error:", err);
  }
};

const handleDelete = async (record) => {
  try {
    let url = '';

    if (view === 'region') {
      url = `${API_URL}/Region/${record.name}`;
    } else if (view === 'subregion') {
      url = `${API_URL}/SubRegion/${record.name}`;
    } else if (view === 'location') {
      url = `${API_URL}/Locations/${record.name}`;
    }

    await axios.delete(url, { headers: HEADERS });
    fetchData();
  } catch (err) {
    console.error("Delete error:", err);
  }
};

  return (
    <div>
      <Tabs activeKey={view} onChange={(key) => setView(key)}>
        <TabPane tab="Region" key="region" />
        <TabPane tab="SubRegion" key="subregion" />
        <TabPane tab="Location" key="location" />
      </Tabs>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={showModal}
      >
        Add {view}
      </Button>

      <Table
        rowKey="name"
        columns={getColumns()}
        dataSource={
          view === 'region'
            ? regionData
            : view === 'subregion'
            ? subRegionData
            : locationData
        }
        pagination={pagination}
        onChange={(pag) => setPagination(pag)}
      />

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
        width={500}
      >
<Form form={form} layout="vertical">
  {/* Hidden docname field for storing Frappe document name (used in edit) */}
  <Form.Item name="docname" hidden>
    <Input />
  </Form.Item>

  {view === 'region' && (
    <Form.Item
      name="name"
      label="Region Name"
      rules={[{ required: true, message: 'Region name is required' }]}
    >
      <Input />
    </Form.Item>
  )}

  {view === 'subregion' && (
    <>
      <Form.Item
        name="region_name"
        label="Select Region"
        rules={[{ required: true, message: 'Please select a region' }]}
      >
        <Select>
          {regionData.map((region) => (
            <Option key={region.name} value={region.region_name}>
              {region.region_name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="name"
        label="SubRegion Name"
        rules={[{ required: true, message: 'Subregion name is required' }]}
      >
        <Input />
      </Form.Item>
    </>
  )}

  {view === 'location' && (
    <>
      <Form.Item
        name="region_name"
        label="Select Region"
        rules={[{ required: true, message: 'Please select a region' }]}
      >
        <Select>
          {regionData.map((region) => (
            <Option key={region.name} value={region.region_name}>
              {region.region_name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="subregion_name"
        label="Select SubRegion"
        rules={[{ required: true, message: 'Please select a subregion' }]}
      >
        <Select>
          {subRegionData.map((sub) => (
            <Option key={sub.name} value={sub.subregion_name}>
              {sub.subregion_name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="name"
        label="Location Name"
        rules={[{ required: true, message: 'Location name is required' }]}
      >
        <Input />
      </Form.Item>
    </>
  )}
</Form>


      </Drawer>
    </div>
  );
};

export default RegionManagement;
