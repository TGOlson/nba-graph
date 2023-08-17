import React from "react";
import ReactDOMClient from 'react-dom/client';

import App from "./App";

import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";

import '@fontsource/inter';

const rootElement = document.getElementById("root") as HTMLElement;

const root = ReactDOMClient.createRoot(rootElement);
root.render(
  <CssVarsProvider>
    <CssBaseline />
    <App />
  </CssVarsProvider>
);
