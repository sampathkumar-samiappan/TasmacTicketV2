import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Form,
  Drawer,
  Typography,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { API_URL, HEADERS } from '../API Config/config';

const { TabPane } = Tabs;
const { Option } = Select;

const ProjectPage = () => {
  const [selectedTab, setSelectedTab] = useState('project');
  const [projectData, setProjectData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/ProjectMaster?fields=["name","project_name"]`, { headers: HEADERS })
      .then((res) => res.json())
      .then((data) => setProjectData(data.data || []));

    fetch(`${API_URL}/ProjectMasterGroup?fields=["name","project_master","project_category"]`, { headers: HEADERS })
      .then((res) => res.json())
      .then((data) => setCategoryData(data.data || []));
  }, []);

  const filteredProjectData = projectData.filter(
    (item) =>
      item.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategoryData = categoryData.filter(
    (item) =>
      item.project_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.project_master?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = selectedTab === 'project'
    ? [
        { title: 'Project Code', dataIndex: 'name', key: 'name' },
        { title: 'Project Name', dataIndex: 'project_name', key: 'project_name' },
      ]
    : [
        { title: 'Category Code', dataIndex: 'name', key: 'name' },
        { title: 'Project Code', dataIndex: 'project_master', key: 'project_master' },
        { title: 'Category Name', dataIndex: 'project_category', key: 'project_category' },
      ];

  const handleSubmitProject = () => {
    const payload = { project_name: projectName };
    fetch(`${API_URL}/ProjectMaster`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(payload),
    }).then(() => {
      setIsProjectModalOpen(false);
      setProjectName('');
      window.location.reload();
    });
  };

  const handleSubmitCategory = () => {
    const payload = { project_master: selectedProject, project_category: categoryName };
    fetch(`${API_URL}/ProjectMasterGroup`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(payload),
    }).then(() => {
      setIsCategoryModalOpen(false);
      setSelectedProject('');
      setCategoryName('');
      window.location.reload();
    });
  };

  return (
    <div >
      <Tabs activeKey={selectedTab} onChange={setSelectedTab}>
        <TabPane tab="Project" key="project" />
        <TabPane tab="Project Category" key="category" />
      </Tabs>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Button
          type="primary"
          
          onClick={() => selectedTab === 'project' ? setIsProjectModalOpen(true) : setIsCategoryModalOpen(true)}
        >
          {selectedTab === 'project' ? 'Add Project' : 'Add Project Category'}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={(selectedTab === 'project' ? filteredProjectData : filteredCategoryData).map((item, index) => ({
          key: index,
          ...item,
        }))}
        pagination={{ pageSize: 10 }}
        bordered
        rowClassName={() => 'custom-table-row'}
      />

{/* Add Project Drawer */}
<Drawer
  title="Add Project"
  placement="right"
  width={400}
  onClose={() => setIsProjectModalOpen(false)}
  open={isProjectModalOpen}
  footer={
    <div style={{ textAlign: 'right' }}>
      <Button onClick={() => setIsProjectModalOpen(false)} style={{ marginRight: 8 }}>
        Cancel
      </Button>
      <Button onClick={handleSubmitProject} type="primary" style={{ backgroundColor: '#403d47' }}>
        Submit
      </Button>
    </div>
  }
>
  <Form layout="vertical">
    <Form.Item label="Project Name" required>
      <Input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Enter Project Name"
      />
    </Form.Item>
  </Form>
</Drawer>

{/* Add Category Drawer */}
<Drawer
  title="Add Project Category"
  placement="right"
  width={400}
  onClose={() => setIsCategoryModalOpen(false)}
  open={isCategoryModalOpen}
  footer={
    <div style={{ textAlign: 'right' }}>
      <Button onClick={() => setIsCategoryModalOpen(false)} style={{ marginRight: 8 }}>
        Cancel
      </Button>
      <Button onClick={handleSubmitCategory} type="primary" style={{ backgroundColor: '#403d47' }}>
        Submit
      </Button>
    </div>
  }
>
  <Form layout="vertical">
    <Form.Item label="Select Project" required>
      <Select
        value={selectedProject}
        onChange={setSelectedProject}
        placeholder="Select Project"
      >
        {projectData.map((proj) => (
          <Option key={proj.name} value={proj.name}>
            {proj.project_name}
          </Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item label="Category Name" required>
      <Input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="Enter Category Name"
      />
    </Form.Item>
  </Form>
</Drawer>

    </div>
  );
};

export default ProjectPage;
