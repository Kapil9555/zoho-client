import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <>
      {/* <Header /> */}

      {/* Global responsive container */}
      <main className="w-full">
        {children}
      </main>

      {/* <Footer /> */}
    </>
  );
};

export default Layout;
