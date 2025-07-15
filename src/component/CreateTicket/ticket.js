import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Footer from "../Footer/Footer";

import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  Card,
  Row,
  Col,
  Divider,
  Empty,
  Breadcrumb,
} from 'antd';
import { UploadOutlined ,HomeOutlined} from '@ant-design/icons';
import axios from 'axios';
import { HEADERS, BASE_URL } from '../API Config/config';

const { Option } = Select;
const { TextArea } = Input;

const CreateTicketForm = () => {
  const [form] = Form.useForm();
  const [category, setCategory] = useState('');
  const [depots, setDepots] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [rvShops, setRvShops] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [ticketType, setTicketType] = useState('');
  const [tntType, setTntType] = useState('');
  const [fields, setFields] = useState({
    office_category: [],
    asset_type: [],
    make: [],
    model: [],
    serial_numbers: [],
  });


  useEffect(() => {
    console.log('Selected category:', category);

    if (category === 'Depot') {
      fetch(`${BASE_URL}/api/method/get_depot`, { headers: HEADERS })
        .then(res => res.json())
        .then(data => {
          console.log('Fetched depots:', data);
          setDepots(data.message?.depots || []);
        })
        .catch(err => console.error('Error fetching depots:', err));
    } else if (category === 'Supplier') {
      fetch(`${BASE_URL}/api/method/get_supplier_name`, { headers: HEADERS })
        .then(res => res.json())
        .then(data => {
          console.log('Fetched suppliers:', data);
          setSuppliers(data.message?.suppliers || []);
        })
        .catch(err => console.error('Error fetching suppliers:', err));
    } else if (category === 'RV Shop') {
      fetch(`${BASE_URL}/api/method/get_shop_numbers`, { headers: HEADERS })
        .then(res => res.json())
        .then(data => {
          console.log('Fetched rvShops:', data);
          setRvShops(data.message || []);
        })
        .catch(err => console.error('Error fetching rvShops:', err));
    }
  }, [category]);

  //get_shop_numbers


  const fetchOfficeCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/resource/Asset?fields=["office_category"]&limit_page_length=1000`, {
        headers: HEADERS,
      });
      const data = await response.json();
      const uniqueCategories = [...new Set(data.data.map(item => item.office_category).filter(Boolean))];
      setFields(prev => ({ ...prev, office_category: uniqueCategories }));
    } catch (err) {
      console.error('Error fetching office categories:', err);
    }
  };

  const fetchDropdownData = async () => {
    const values = form.getFieldsValue();
    const query = new URLSearchParams({
      office_category: values.office_category || '',
      asset_type: values.asset_type || '',
      make: values.make || '',
      model: values.model || '',
    }).toString();

    try {
      const res = await fetch(`${BASE_URL}/api/method/get_asset_types_by_office_category?${query}`, {
        headers: HEADERS,
      });
      const data = await res.json();
      console.log('API Response:', data);

      setFields(prev => ({
        ...prev,
        asset_type: data.message?.asset_types || [],
        make: data.message?.makes || [],
        model: data.message?.models || [],
        serial_numbers: data.message?.serial_numbers || [],
      }));
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  const handleChange = (field, value) => {
    form.setFieldsValue({ [field]: value });

    if (field === 'office_category') {
      form.setFieldsValue({ asset_type: null, make: null, model: null, serial_number: null });
    } else if (field === 'asset_type') {
      form.setFieldsValue({ make: null, model: null, serial_number: null });
    } else if (field === 'make') {
      form.setFieldsValue({ model: null, serial_number: null });
    } else if (field === 'model') {
      form.setFieldsValue({ serial_number: null });
    }

    fetchDropdownData();
  };

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const { region, dm, depot, shop_number, username } = parsed;
        form.setFieldsValue({ region, dm, depot, shop_number, current_user: username });
      } catch (e) {
        console.error("userData parse error", e);
      }
    }
    fetchOfficeCategories();
  }, []);

  const handleFileChange = info => setFileList(info.fileList.slice(-1));
  const handleSubmit = async values => {
    try {
      let fileUrl = null;
      if (fileList.length > 0) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        formData.append('is_private', '1');
        formData.append('folder', 'Home');

        const upload = await axios.post(`${BASE_URL}/api/method/upload_file`, formData, {
          headers: {
            Authorization: HEADERS.Authorization,
            Accept: 'application/json',
          },
        });

        fileUrl = upload.data.message.file_url;
      }

      const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const formattedIST = nowIST.toISOString().slice(0, 19).replace('T', ' ');
      const storedUserData = localStorage.getItem('userData');
      const userId = storedUserData ? JSON.parse(storedUserData).user_id : null;

      await axios.post(`${BASE_URL}/api/resource/TasmacTicket`, {
        ...values,
        current_user: userId,
        uploadfile: fileUrl,
        created_on: formattedIST,
        status: 'Open',
      }, { headers: HEADERS });

      form.resetFields();
      setFileList([]);
      Swal.fire({ icon: 'success', title: 'Ticket Submitted Successfully!'  ,timer: 2000,
  timerProgressBar: true});
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Submission Failed!', text: err.message || 'Something went wrong.' , timer: 2000,
  timerProgressBar: true});
    }
  };

  return (
     <>
    <Card style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 10 }}>
      {/* <h2>Create Ticket</h2> */}
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
            title: <a href="">Create Ticket</a>,
          }
        ]}
      />
      <Divider />
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="ticket_category" label="Ticket Category" rules={[{ required: true }]}>
              <Select onChange={v => setTicketType(v)}>
                <Option value="Software">Software</Option>
                <Option value="Hardware">Hardware</Option>
              </Select>
            </Form.Item>
          </Col>

          {ticketType === 'Hardware' && (
            <>
              <Col span={8}>
                <Form.Item name="office_category" label="Office Category" rules={[{ required: true }]}>
                  <Select onChange={val => handleChange('office_category', val)}>
                    {fields.office_category.map(v => <Option key={v}>{v}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}><Form.Item name="asset_type" label="Asset Type" rules={[{ required: true }]}><Select onChange={val => handleChange('asset_type', val)}>{fields.asset_type.map(v => <Option key={v}>{v}</Option>)}</Select></Form.Item></Col>
              <Col span={8}><Form.Item name="make" label="Make" rules={[{ required: true }]}><Select onChange={val => handleChange('make', val)}>{fields.make.map(v => <Option key={v}>{v}</Option>)}</Select></Form.Item></Col>
              <Col span={8}><Form.Item name="model" label="Model" rules={[{ required: true }]}><Select onChange={val => handleChange('model', val)}>{fields.model.map(v => <Option key={v}>{v}</Option>)}</Select></Form.Item></Col>
              <Col span={8}><Form.Item name="serial_number" label="Serial Number" rules={[{ required: true }]}><Select>{fields.serial_numbers.map(v => <Option key={v}>{v}</Option>)}</Select></Form.Item></Col>
            </>
          )}

          {ticketType === 'Software' && (
            <>
              <Col span={8}><Form.Item name="ticket_type" label="Ticket Type" rules={[{ required: true }]}><Select onChange={v => setTntType(v)}><Option value="TNT">TNT</Option><Option value="HRMS">HRMS</Option><option value="Dashboard & Reports">Dashboard & Reports</option><option value="Finance">Finance</option></Select></Form.Item></Col>
              {tntType === 'TNT' && (
                <>
                  <Col span={8}>
                    <Form.Item name="category" label="Category">
                      <Select
                        allowClear
                        onChange={value => {
                          console.log('Category changed to:', value);
                          setCategory(value);
                          form.setFieldsValue({ name_of_supplier: '' });
                        }}
                      >
                        <Option value="Supplier">Supplier</Option>
                        <Option value="Depot">Depot</Option>
                        <Option value="RV Shop">RV Shop</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    {category === "Depot" && (
                      <Form.Item
                        name="depot_name"
                        label="Depot Name"
                        rules={[{ required: true, message: 'Please select a Depot!' }]}
                      >
                        <Select
                          placeholder="Select Depot"
                          dropdownRender={menu => (
                            <>
                              <div style={{ padding: 8 }}>
                                <Input
                                  placeholder="Enter other depot name"
                                  onPressEnter={e => {
                                    const value = e.target.value.trim();
                                    if (value) {
                                      form.setFieldsValue({ depot_name: `(Others) ${value}` });
                                    }
                                  }}
                                  onBlur={e => {
                                    const value = e.target.value.trim();
                                    if (value) {
                                      form.setFieldsValue({ depot_name: `(Others) ${value}` });
                                    }
                                  }}
                                />
                              </div>
                              <Divider style={{ margin: '4px 0' }} />
                              {menu}
                            </>
                          )}
                        >
                          {depots.map(d => (
                            <Option key={d.depot_id} value={d.depot_name}>
                              {d.depot_name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )}

                    {category === "Supplier" && (
                      <Form.Item
                        name="supplier_name"
                        label="Supplier Name"
                        rules={[{ required: true, message: 'Please select a Supplier!' }]}
                      >
                        <Select
                          placeholder="Select Supplier"
                          dropdownRender={menu => (
                            <>
                              <div style={{ padding: 8 }}>
                                <Input
                                  placeholder="Enter other supplier name"
                                  onPressEnter={e => {
                                    const value = e.target.value.trim();
                                    if (value) {
                                      form.setFieldsValue({ supplier_name: `(Others) ${value}` });
                                    }
                                  }}
                                  onBlur={e => {
                                    const value = e.target.value.trim();
                                    if (value) {
                                      form.setFieldsValue({ supplier_name: `(Others) ${value}` });
                                    }
                                  }}
                                />
                              </div>
                              <Divider style={{ margin: '4px 0' }} />
                              {menu}
                            </>
                          )}
                        >
                          {suppliers.map(s => (
                            <Option key={s.supplier_id} value={s.supplier_name}>
                              {s.supplier_name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )}

                    {category === "RV Shop" && (
                      <Form.Item
                        name="rvshop_no"
                        label="RV Shop Number"
                        rules={[{ required: true, message: 'Please select an RV Shop!' }]}
                      >
                        <Select
                          placeholder="Select RV Shop"
                          dropdownRender={menu => (
                            <>
                              <div style={{ padding: 8 }}>
                                <Input
                                  placeholder="Enter other RV shop number"
                                  onPressEnter={e => {
                                    const value = e.target.value.trim();
                                    if (value) {
                                      form.setFieldsValue({ rvshop_no: `(Others) ${value}` });
                                    }
                                  }}
                                  onBlur={e => {
                                    const value = e.target.value.trim();
                                    if (value) {
                                      form.setFieldsValue({ rvshop_no: `(Others) ${value}` });
                                    }
                                  }}
                                />
                              </div>
                              <Divider style={{ margin: '4px 0' }} />
                              {menu}
                            </>
                          )}
                        >
                          {rvShops.map(rv => (
                            <Option key={rv.rvshop_id} value={rv.shop_number}>
                              {rv.shop_number}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )}
                  </Col>
                  <Col span={8}><Form.Item name="indent_no" label="Indent No"><Input /></Form.Item></Col>
                  <Col span={8}><Form.Item name="case_no" label="Case No"><Input /></Form.Item></Col>
                  <Col span={8}><Form.Item name="hologram_no" label="Hologram No"><Input /></Form.Item></Col>
                </>
              )}
            </>
          )}
          <Col span={8}><Form.Item name="issue_type" label="Issue Type" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={8}><Form.Item name="ticket_raised_by" label="Ticket Raised By" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={8}><Form.Item name="raised_user_phone" label="Contact Number" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={8}><Form.Item name="priority" label="Priority" rules={[{ required: true }]}><Select><Option value="High">High</Option><option value="Medium">Medium</option><Option value="Low">Low</Option></Select></Form.Item></Col>
          {/* <Col span={8}><Form.Item name="status" label="Status"><Select><Option value="Open">Open</Option><Option value="Closed">Closed</Option></Select></Form.Item></Col> */}
          <Col span={8}><Form.Item label="Upload File"><Upload fileList={fileList} onChange={handleFileChange} beforeUpload={() => false} maxCount={1}><Button style={{ width: 250 }} icon={<UploadOutlined />}>Upload</Button></Upload></Form.Item></Col>
          <Col span={24}><Form.Item name="description" label="Description" rules={[{ required: true }]}><TextArea rows={4} /></Form.Item></Col>
        </Row>
        <Form.Item style={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            style={{ width: 120, marginRight: 16 }}
            onClick={() => { form.resetFields(); setFileList([]); }}
          >
            Clear
          </Button>
          <Button style={{ width: 250 }} type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>

      </Form>
    </Card>
   
    <Footer/>
    </>
  );
};

export default CreateTicketForm;