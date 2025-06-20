import React from 'react';

import WrapperHOC from './WrapperHOC';
import WrapperMuiTheme from './WrapperMuiTheme';
import WrapperRouter from './WrapperRouter';
import { WrapperStore } from './test-utils';

const WrapperForJest = ({ children }) => {
  const WrapRouter = WrapperHOC(WrapperRouter);
  const WrapMuiTheme = WrapperHOC(WrapperMuiTheme);
  const WrapStore = WrapperHOC(WrapperStore);
  return (
    <WrapStore>
      <WrapRouter>
        <WrapMuiTheme>{children}</WrapMuiTheme>
      </WrapRouter>
    </WrapStore>
  );
};
export default WrapperForJest;
