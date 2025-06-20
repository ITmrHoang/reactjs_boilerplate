import React from 'react';

import { BrowserRouter } from 'react-router-dom';

const WrapperRouter = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

export default WrapperRouter;
