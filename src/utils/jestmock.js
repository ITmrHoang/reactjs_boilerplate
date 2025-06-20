/* eslint-disable no-undef */
import { cleanup } from "@testing-library/react";

import "./../i18n";
import { useLocation, useSearchParams } from "react-router-dom";

const i18n = jest.requireActual("./../i18n").default;

//OPTIONS using i18n real
jest.mock("react-i18next", () => {
  const actualReactI18next = jest.requireActual("react-i18next");
  return {
    ...actualReactI18next,
  };
});

global.i18n = i18n;

//  mock for hook react route dom: useNavigate
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: jest.fn().mockReturnValue(jest.fn()),
    useLocation: jest.fn(),
    useSearchParams: jest.fn(),
    useParams: () => ({
      id: "1",
    }),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});
beforeEach(() => {
  useLocation.mockReturnValue({
    pathname: "/",
    search: "",
    hash: "",
    state: {
      id: 1,
    },
    key: "n6ivaewv",
  });
  const obj = {};
  obj.get = key => obj[key] ?? "";
  useSearchParams.mockReturnValue([obj, jest.fn(obj => obj)]);
});
afterEach(() => {
  cleanup();
});

const mock_data = {
  data: {
    systemId: 15,
    schemeId: 16,
    hostId: 19,
    portNo: 12,
    enabled: true,
    managedBy: null,
    _createdAt: "2024-10-18T15:49:18.216419",
    _createdBy: "admin",
    _lastUpdatedAt: "2024-10-18T15:49:18.216419",
    _lastUpdatedBy: "admin",
    _lastUpdatedThru: "C",
  },
};

jest.mock("./api", () => ({
  get: url => {
    switch (url) {
      case "/rest/systems/list":
        return Promise.resolve(mock_data);
      default:
        return Promise.resolve({});
    }
  },
}));
