import { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Button, 
  Table, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Popconfirm,
  message,
  Card,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { 
  getAllStudents, 
  createStudent, 
  updateStudent,
  deleteStudent 
} from '../services/api';

const { Title } = Typography;
const { Option } = Select;

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalVisible(true);
  };
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      ...student
    });
    setModalVisible(true);
  };
  const handleDeleteStudent = async (id) => {
    try {
      await deleteStudent(id);
      message.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to delete student. Please try again.');
      }
    }
  };
  const handleModalCancel = () => {
    setModalVisible(false);
  };
  
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      if (dataIndex === 'name') {
        const fullName = `${record.firstName} ${record.middleName || ''} ${record.lastName}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      }
      
      return record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '';
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });
  
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingStudent) {
        // Update existing student
        await updateStudent(editingStudent._id, values);
        message.success('Student updated successfully');
      } else {
        // Create new student
        await createStudent(values);
        message.success('Student created successfully');
      }
      
      setModalVisible(false);
      fetchStudents();
    } catch (error) {
      console.error('Form submission error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else if (!error.errorFields) {
        // Only show generic error if it's not a form validation error
        message.error('Failed to save student. Please check your inputs and try again.');
      }
    }
  };  const columns = [
    {
      title: 'ID Number',
      dataIndex: 'idNumber',
      key: 'idNumber',
      ...getColumnSearchProps('idNumber', 'ID Number'),
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <span>
          {record.firstName} {record.middleName ? record.middleName + ' ' : ''}{record.lastName}
        </span>
      ),
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
      ...getColumnSearchProps('name', 'Name'),
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      ...getColumnSearchProps('course', 'Course'),
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      filters: [
        { text: '1st Year', value: '1st Year' },
        { text: '2nd Year', value: '2nd Year' },
        { text: '3rd Year', value: '3rd Year' },
        { text: '4th Year', value: '4th Year' },
        
      ],
      onFilter: (value, record) => record.year === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditStudent(record)}
            type="primary"
            size="small"
          />
          <Popconfirm
            title="Delete Student"
            description="Are you sure you want to delete this student?"
            onConfirm={() => handleDeleteStudent(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Student Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddStudent}
        >
          Add Student
        </Button>
      </div>      <Card>        <Table 
          columns={columns} 
          dataSource={students} 
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Total ${total} students`
          }}
          rowClassName={() => 'table-row-hover'}
        />
      </Card>

      {/* Student Form Modal */}
      <Modal
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalSubmit}
        width={600}
      >        <Form 
          form={form} 
          layout="vertical"
        >
          <Form.Item
            name="idNumber"
            label="ID Number"
            rules={[{ required: true, message: 'Please enter ID Number' }]}
          >
            <Input placeholder="Student ID Number" />
          </Form.Item>
          
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="middleName"
            label="Middle Name"
          >
            <Input placeholder="Middle Name (optional)" />
          </Form.Item>

          <Form.Item
            name="course"
            label="Course"
            rules={[{ required: true, message: 'Please enter course' }]}
          >
            <Input placeholder="Course" />
          </Form.Item>

          <Form.Item
            name="year"
            label="Year"
            rules={[{ required: true, message: 'Please enter year' }]}
          >
            <Select placeholder="Select Year">
              <Option value="1st Year">1st Year</Option>
              <Option value="2nd Year">2nd Year</Option>
              <Option value="3rd Year">3rd Year</Option>
              <Option value="4th Year">4th Year</Option>
            
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement; 