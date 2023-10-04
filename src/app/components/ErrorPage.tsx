import { Link, Stack, Typography } from "@mui/joy";
import React from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

// type refinement of 'unknown' is kind of a pain...
const hasMessage = (error: unknown): error is object & {message: string} => {
  return error !== null 
    && typeof error === 'object'
    && 'message' in error
    && typeof error.message === 'string';
};

const getErrorMessage = (error: unknown): string => {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
  if (hasMessage(error)) return error.message;

  return 'Unknown error';
};

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  const errorMessage = getErrorMessage(error);
  
  return (
    <Stack sx={{
      height: '100vh', 
      alignItems: 'center', 
      position: 'absolute', 
      width: '100%', 
      gap: 1
      }}>
        <Typography level="h1" sx={{mt: 10}}>Uh-oh!</Typography>
        <Typography level="body-lg">An unexpected error has occurred.</Typography>
        <Typography level="body-sm" variant="soft">{errorMessage}</Typography>
        <Link level="body-sm" href="/" sx={{mt: 1}}>Go back home</Link>
    </Stack>
  );
};

export default ErrorPage;
