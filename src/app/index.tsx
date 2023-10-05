import React from "react";
import ReactDOMClient from 'react-dom/client';
import { RouterProvider, createHashRouter } from "react-router-dom";

import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import '@fontsource/inter';

import Graph from "./pages/Graph";
import ErrorPage from "./pages/ErrorPage";
import Logos from "./pages/Logos";

const router = createHashRouter([
  {
    path: "/",
    element: null,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Graph />,
      },
      {
        path: "logos",
        element: <Logos />,

      },
      {
        path: "/:nodeId",
        element: <Graph />,
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
