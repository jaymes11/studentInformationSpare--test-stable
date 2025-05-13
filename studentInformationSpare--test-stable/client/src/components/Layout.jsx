import { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Typography, theme, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, 
  TeamOutlined, 
  ReadOutlined, 
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Footer, Sider } = AntLayout;
const { Title, Text } = Typography;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { token } = theme.useToken();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/login');
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/')
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Users',
      onClick: () => navigate('/users')
    },
    {
      key: '/students',
      icon: <ReadOutlined />,
      label: 'Students',
      onClick: () => navigate('/students')
    }
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 64, 
          margin: 16 
        }}>
          {!collapsed && <Title level={5} style={{ margin: 0, color: token.colorPrimary }}>Student Management</Title>}
        </div>
        <Menu 
          theme="light" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          padding: '0 16px', 
          background: token.colorBgContainer, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between', 
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' 
        }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              User & Student Management System
            </Title>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />
            <Text strong>{user?.firstName} {user?.lastName}</Text>
            <Button 
              type="text" 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ 
            padding: 24, 
            minHeight: 360, 
            background: token.colorBgContainer,
            borderRadius: token.borderRadius 
          }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          User & Student Management System ©{new Date().getFullYear()}
        </Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 