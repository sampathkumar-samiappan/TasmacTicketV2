import { useEffect, useState } from "react";
import { Form, Input, Select, Row, Col } from "antd";
import axios from "axios";
import { URL_ticketuser, HEADERS } from "../API Config/config";

const { Option } = Select;

const TicketForm = ({
  formValues,
  handleChange,
  isEdit,
  editableFields = [],
  onFormInstanceReady,
}) => {
  const [form] = Form.useForm();
  const [serviceEngineers, setServiceEngineers] = useState([]);

  const isDisabled = (field) => isEdit && !editableFields.includes(field);

  useEffect(() => {
    const fetchServiceEngineers = async () => {
      try {
        const response = await axios.get(`${URL_ticketuser}?fields=["*"]`, {
          headers: HEADERS,
        });

        const currentUser = JSON.parse(localStorage.getItem("userData"));
        const userDepot = currentUser?.depot;

        const engineers = response.data.data.filter(
          (user) =>
            user.usertype === "Service Engineer" && user.depot === userDepot
        );

        setServiceEngineers(engineers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchServiceEngineers();
  }, []);

  // Optional: Pass form instance to parent if needed for submission
  useEffect(() => {
    if (onFormInstanceReady) {
      onFormInstanceReady(form);
    }
  }, [form, onFormInstanceReady]);

  return (
    <Form layout="vertical" form={form} initialValues={formValues}>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="Asset Type" name="asset_type">
            <Input
              name="asset_type"
              value={formValues.asset_type}
              onChange={handleChange}
              disabled={isDisabled("asset_type")}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Asset Category" name="assets_category">
            <Input
              name="assets_category"
              value={formValues.assets_category}
              onChange={handleChange}
              disabled={isDisabled("assets_category")}
            />
          </Form.Item>
        </Col>

        {/* ✅ New: Supplier Name */}
        <Col span={24}>
          <Form.Item label="Supplier Name" name="supplier_name">
            <Input
              name="supplier_name"
              value={
                formValues.supplier_name?.trim()
                  ? formValues.supplier_name
                  : "N/A"
              }
              disabled
            />
          </Form.Item>
        </Col>

        {/* ✅ New: RV Shop */}
        <Col span={24}>
          <Form.Item label="RV Shop" name="rvshop_no">
            <Input
              name="rvshop_no"
              value={
                formValues.rvshop_no?.trim()
                  ? formValues.rvshop_no
                  : "N/A"
              }
              disabled
            />
          </Form.Item>
        </Col>

        {/* ✅ New: Depot Name */}
        <Col span={24}>
          <Form.Item label="Depot Name" name="depot_name">
            <Input
              name="depot_name"
              value={
                formValues.depot_name?.trim()
                  ? formValues.depot_name
                  : "N/A"
              }
              disabled
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Priority" name="priority">
            <Input
              name="priority"
              value={formValues.priority}
              onChange={handleChange}
              disabled={isDisabled("priority")}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Office Category" name="office_category">
            <Input
              name="office_category"
              value={formValues.office_category}
              onChange={handleChange}
              disabled={isDisabled("office_category")}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Assigned To" name="assignedto">
            <Select
              showSearch
              placeholder="Select Service Engineer"
              value={formValues.assignedto}
              onChange={(value) =>
                handleChange({ target: { name: "assignedto", value } })
              }
              optionFilterProp="children"
            >
              {serviceEngineers.map((user) => (
                <Option key={user.name} value={user.name}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select
              name="status"
              value={formValues.status}
              onChange={(value) =>
                handleChange({ target: { name: "status", value } })
              }
              disabled={["Closed", "Cancelled"].includes(formValues.status)}
            >
              <Option value="Open">Open</Option>
              <Option value="Closed">Closed</Option>
              <Option value="On Hold">On Hold</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            label="Remarks"
            name="remarks"
            rules={[
              { required: true, message: "Remarks is required" },
              { whitespace: true, message: "Remarks cannot be empty" },
            ]}
          >
            <Input.TextArea
              name="remarks"
              value={formValues.remarks || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Enter remarks here"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default TicketForm;
