import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { StreamHealth } from "../types";
import { getStatusIcon, getStatusColor } from "../utils";

interface UnhealthyStreamsListProps {
  streams: StreamHealth[];
}

const UnhealthyStreamsList: React.FC<UnhealthyStreamsListProps> = ({
  streams,
}) => {
  if (streams.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom color="error.main">
            Unhealthy Streams
          </Typography>
          {streams.map((stream) => (
            <Box
              key={stream.video_id}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "error.light",
                borderRadius: 1,
                mb: 1,
                bgcolor: "error.light",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                {getStatusIcon(stream.status)}
                <Typography variant="subtitle1" sx={{ ml: 1, flexGrow: 1 }}>
                  {stream.video_title}
                </Typography>
                <Chip
                  label={stream.status.replace("_", " ")}
                  size="small"
                  color={getStatusColor(stream.status)}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {stream.error && `Error: ${stream.error}`}
                {stream.process_name && `Process: ${stream.process_name}`}
                {stream.pid && `PID: ${stream.pid}`}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UnhealthyStreamsList;
