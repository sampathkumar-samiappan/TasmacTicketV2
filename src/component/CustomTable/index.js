import React, { useState ,useRef} from 'react';
import { Form, Input, InputNumber, Popconfirm, Table, Typography, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const originData = Array.from({ length: 100 }).map((_, i) => ({
  key: i.toString(),
  name: `Edward ${i}`,
  age: 32,
  address: `London Park no. ${i}`,
}));

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const getColumnSearchProps = (dataIndex, searchInputRef, searchText, setSearchText, searchedColumn, setSearchedColumn) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInputRef}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            confirm();
            setSearchText(selectedKeys[0]);
            setSearchedColumn(dataIndex);
          }}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <a
            onClick={() => {
              confirm();
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
            style={{ color: '#1890ff', marginRight: 8 }}
          >
            Search
          </a>
          <a
            onClick={() => {
              clearFilters();
              setSearchText('');
            }}
          >
            Reset
          </a>
        </div>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const App = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState(originData);
    const [editingKey, setEditingKey] = useState('');
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
  
    const isEditing = (record) => record.key === editingKey;
  
    const edit = (record) => {
      form.setFieldsValue({ name: '', age: '', address: '', ...record });
      setEditingKey(record.key);
    };
  
    const cancel = () => {
      setEditingKey('');
    };
  
    const save = async (key) => {
      try {
        const row = await form.validateFields();
        const newData = [...data];
        const index = newData.findIndex((item) => key === item.key);
  
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, { ...item, ...row });
          setData(newData);
          setEditingKey('');
        } else {
          newData.push(row);
          setData(newData);
          setEditingKey('');
        }
      } catch (errInfo) {
        console.log('Validate Failed:', errInfo);
      }
    };
  
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        width: '25%',
        editable: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ['descend', 'ascend'],
        ...getColumnSearchProps('name', searchInput, searchText, setSearchText, searchedColumn, setSearchedColumn),
      },
      {
        title: 'Age',
        dataIndex: 'age',
        width: '15%',
        editable: true,
        sorter: (a, b) => a.age - b.age,
        sortDirections: ['descend', 'ascend'],
        ...getColumnSearchProps('age', searchInput, searchText, setSearchText, searchedColumn, setSearchedColumn),
      },
      {
        title: 'Address',
        dataIndex: 'address',
        width: '40%',
        editable: true,
        sorter: (a, b) => a.address.localeCompare(b.address),
        sortDirections: ['descend', 'ascend'],
        ...getColumnSearchProps('address', searchInput, searchText, setSearchText, searchedColumn, setSearchedColumn),
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        render: (_, record) => {
          const editable = isEditing(record);
          return editable ? (
            <span>
              <Typography.Link onClick={() => save(record.key)} style={{ marginInlineEnd: 8 }}>
                Save
              </Typography.Link>
              <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                <a>Cancel</a>
              </Popconfirm>
            </span>
          ) : (
            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
              Edit
            </Typography.Link>
          );
        },
      },
    ];
  
    const mergedColumns = columns.map((col) =>
      !col.editable
        ? col
        : {
            ...col,
            onCell: (record) => ({
              record,
              inputType: col.dataIndex === 'age' ? 'number' : 'text',
              dataIndex: col.dataIndex,
              title: col.title,
              editing: isEditing(record),
            }),
          }
    );
  
    return (
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell } }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{ onChange: cancel }}
        />
      </Form>
    );
  };
  

export default App;
