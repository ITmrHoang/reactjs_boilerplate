import React from 'react';

import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

const WrapperMuiTheme = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default WrapperMuiTheme;
