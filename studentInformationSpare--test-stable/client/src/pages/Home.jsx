import { Typography, Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getAllUsers, getAllStudents } from '../services/api';

const { Title, Paragraph } = Typography;

const Home = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const users = await getAllUsers();
        const students = await getAllStudents();
        setUsersCount(users.length);
        setStudentsCount(students.length);
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setLoading(false);
      }
    };
  

    fetchCounts();
  }, []);

  return (
    <div>
      <Title level={2}>Welcome to the User & Student Management System</Title>
      <Paragraph>
        HILOOOO
      </Paragraph>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12}>
          <Card loading={loading}>
            <Statistic
              title="Total Users"
              value={usersCount}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card loading={loading}>
            <Statistic
              title="Total Students"
              value={studentsCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
