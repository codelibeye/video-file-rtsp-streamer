import React from "react";
import { CheckCircle, Error, Warning, Info } from "@mui/icons-material";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "healthy":
      return <CheckCircle color="success" />;
    case "invalid_process":
    case "process_not_found":
      return <Error color="error" />;
    case "error":
      return <Warning color="warning" />;
    default:
      return <Info color="info" />;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "healthy":
      return "success";
    case "invalid_process":
    case "process_not_found":
      return "error";
    case "error":
      return "warning";
    default:
      return "default";
  }
};

export const formatLastRefresh = (date: Date) => {
  return date.toLocaleTimeString();
};
