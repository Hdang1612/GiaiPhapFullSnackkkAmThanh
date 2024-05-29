import React from 'react';
import { Flex, Layout } from 'antd';

function LayoutComponent() {
    const { Header, Footer, Sider, Content } = Layout;
  return (
    <div>
        <Layout >
      <Header >Header</Header>
      <Layout>
        <Content >Content</Content>
        <Sider width="25%" >
          Sider
        </Sider>
      </Layout>
      <Footer >Footer</Footer>
    </Layout>
    </div>
  )
}

export default LayoutComponent