import { Typography } from "@mui/material";
import React from "react";

type Props = {
  individual_geojson_data: Course;
};

const IndividualMap: React.FC<Props> = ({ individual_geojson_data }) => {
  return (
    <>
      {individual_geojson_data && (
        <Typography
          width={"100%"}
          bgcolor={"white"}
          textAlign={"center"}
          color={"#16E5F2"}
        >
          {individual_geojson_data.title}
        </Typography>
      )}
    </>
  );
};

export default IndividualMap;
