import { Typography } from "@mui/material";
import React from "react";

type Props = {
  individual_geojson_data: Course;
};

const IndividualMap: React.FC<Props> = ({ individual_geojson_data }) => {
  return (
    <>
      {individual_geojson_data && (
        // /laytout.tsxのbodyに入っているbgを消せば背景が白になるが、影響範囲が広いかもなのでここだけ一時的に白にする
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
