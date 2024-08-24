import AllMaps from "@/components/AllMaps";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Maps() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: geojson_data, error } = await supabase
    .from("geojson_data")
    .select("*");
  console.log("geojson_data", geojson_data);

  if (error) {
    console.log("error", error);
  }

  return <>{geojson_data && <AllMaps geojson_data={geojson_data} />}</>;
}
