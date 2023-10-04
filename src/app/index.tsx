import React from "react";
import ReactDOMClient from 'react-dom/client';
import { RouterProvider, createHashRouter } from "react-router-dom";

import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import '@fontsource/inter';

import App from "./App";
import ErrorPage from "./components/ErrorPage";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/:nodeId",
        element: <App />,
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
