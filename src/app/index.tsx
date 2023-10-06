import React from "react";
import ReactDOMClient from 'react-dom/client';
import { RouterProvider, createHashRouter } from "react-router-dom";

import '@fontsource/inter';
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";

import "./index.css";

import GraphPage from "./pages/GraphPage";
import LogoPage from "./pages/LogoPage";
import PathPage from "./pages/PathPage";
import ErrorPage from "./pages/ErrorPage";

const router = createHashRouter([
  {
    path: "/",
    element: null,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <GraphPage />,
      },
      {
        path: "logos",
        element: <LogoPage />,
      },
      {
        path: "paths",
        element: <PathPage />,
      },
      {
        path: "paths/:path",
        element: <PathPage />,
      },
      {
        path: "graph",
        element: <GraphPage />,
      },
      {
        path: "graph/:nodeId",
        element: <GraphPage />,
      },
      {
        path: ":nodeId",
        element: <GraphPage />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOMClient.createRoot(rootElement);

root.render(
  <CssVarsProvider>
    <CssBaseline />
    <RouterProvider router={router} />
  </CssVarsProvider>
);
