import { Typography } from "@mui/material";
import React from "react";

type Props = {
  individual_geojson_data: Course;
};

const IndividualMap: React.FC<Props> = ({ individual_geojson_data }) => {
  return (
    <>
      {individual_geojson_data && (
        <Typography variant="h4">{individual_geojson_data.title}</Typography>
        
      )}
    </>
  );
};

export default IndividualMap;
