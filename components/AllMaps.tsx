import { Box, Typography } from "@mui/material";
import Link from "next/link";

type GeoJsonFeature = {
  crs: object;
  name: string;
  type: "FeatureCollection";
  features: any[];
};

type MapData = {
  id: number;
  created_at: string;
  geo_json: GeoJsonFeature;
  title: string;
  ward: string;
};

type Props = {
  geojson_data: MapData[];
};

const AllMaps: React.FC<Props> = ({ geojson_data }) => {
  return (
    <>
      <Typography variant="h4" mt={6} mb={2}>
        All Maps
      </Typography>
      <Box
        display={"flex"}
        flexDirection={"row"}
        flexWrap={"wrap"}
        mx={7}
        my={4}
      >
        {geojson_data.map((data) => {
          return (
            <Link href={`/maps/${data.id}`}>
              <Box
                display={"flex"}
                flexDirection={"column"}
                padding={"16px"}
                margin={"8px"}
                borderRadius={"16px"}
                boxShadow={"0 4px 8px rgba(0,0,0,0.1)"}
                width={"250px"}
                height={"200px"}
                sx={{
                  backgroundColor: "white",
                }}
              >
                <Typography variant="h6" sx={{ marginBottom: "8px" }}>
                  {data.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.ward}
                </Typography>
                {/* TODO: 他にも必要な情報があれば追加する */}
              </Box>
            </Link>
          );
        })}
      </Box>
    </>
  );
};

export default AllMaps;
