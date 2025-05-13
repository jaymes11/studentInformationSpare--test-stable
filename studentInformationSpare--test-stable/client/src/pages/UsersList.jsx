import { useEffect, useState, useRef } from 'react';
import { 
  Table, 
  Typography, 
  Card, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Popconfirm,
  message,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../services/api';

const { Title } = Typography;

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      userId: user.userId || '',
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || '',
      email: user.email
    });
    setModalVisible(true);
  };
  const handleDeleteUser = async (id) => {
    try {
      console.log('Attempting to delete user with ID:', id);
      const response = await deleteUser(id);
      console.log('Delete response:', response);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        message.error(`Failed to delete user: ${error.response.data.message || error.message}`);
      } else {
        message.error(`Failed to delete user: ${error.message}`);
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
      
      if (editingUser) {
        // Update existing user
        await updateUser(editingUser._id, values);
        message.success('User updated successfully');
      } else {
        // Create new user (requires password for new users)
        await createUser(values);
        message.success('User created successfully');
      }
      
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Form submission error:', error);
      message.error('Failed to save user');
    }
  };
  const columns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId) => userId || 'Not Set',
      ...getColumnSearchProps('userId', 'User ID'),
    },
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_, record) => (
        <span>
          {record.firstName} {record.middleName ? record.middleName + ' ' : ''}{record.lastName}
        </span>
      ),
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      ...getColumnSearchProps('name', 'Name'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps('email', 'Email'),
    },
    {
      title: 'Registered Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Space direction="vertical">
            <Button
              onClick={() => {
                setSelectedKeys(['today']);
                confirm();
              }}
              size="small"
            >
              Today
            </Button>
            <Button
              onClick={() => {
                setSelectedKeys(['thisWeek']);
                confirm();
              }}
              size="small"
            >
              This Week
            </Button>
            <Button
              onClick={() => {
                setSelectedKeys(['thisMonth']);
                confirm();
              }}
              size="small"
            >
              This Month
            </Button>
            <Button
              onClick={() => clearFilters && clearFilters()}
              size="small"
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => {
        const date = new Date(record.createdAt);
        const now = new Date();
        
        if (value === 'today') {
          return date.toDateString() === now.toDateString();
        } else if (value === 'thisWeek') {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          return date >= weekStart;
        } else if (value === 'thisMonth') {
          return date.getMonth() === now.getMonth() && 
                 date.getFullYear() === now.getFullYear();
        }
        
        return true;
      }
    },
 
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Users List</Title>
        {/* <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddUser}
        >
          Add User
        </Button> */}
      </div>
      <Card>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="_id"
          loading={loading}          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Total ${total} users`
          }}
          rowClassName={() => 'table-row-hover'}
        />
      </Card>

      {/* User Form Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalSubmit}
        width={600}
      >
        <Form 
          form={form} 
          layout="vertical"
        >
          <Form.Item
            name="userId"
            label="User ID"
          >
            <Input placeholder="User ID (optional)" />
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
          )}        </Form>
      </Modal>    </div>
  );
};

export default UsersList;