import React from 'react';

const WrapperHOC = (WrappedComponent, props = {}) => {
  return function Component({ children }) {
    return <WrappedComponent {...props}>{children}</WrappedComponent>;
  };
};

export default WrapperHOC;
