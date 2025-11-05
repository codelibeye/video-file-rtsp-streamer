import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { HealthResponse } from "../types";

interface StreamSummaryCardsProps {
  healthData: HealthResponse;
}

const StreamSummaryCards: React.FC<StreamSummaryCardsProps> = ({
  healthData,
}) => {
  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Box flex="1" minWidth={{ xs: 300, md: 250 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Streams
            </Typography>
            <Typography variant="h4">{healthData.total_streams}</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box flex="1" minWidth={{ xs: 300, md: 250 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Healthy Streams
            </Typography>
            <Typography variant="h4" color="success.main">
              {healthData.healthy_streams}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box flex="1" minWidth={{ xs: 300, md: 250 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Unhealthy Streams
            </Typography>
            <Typography variant="h4" color="error.main">
              {healthData.unhealthy_streams_count}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default StreamSummaryCards;
