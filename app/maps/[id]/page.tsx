import IndividualMap from "@/components/IndividualMap";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import GoogleMap from "@/components/GoogleMap";
export default async function MapPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  //idに合致するデータを取得する
  const { data, error } = await supabase
    .from("geojson_data")
    .select("*")
    .eq("id", params.id);
  console.log("data", data);

  if (error) {
    console.log("error", error);
  }

  // プロフィールデータを取得
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("プロフィール取得エラー:", profileError);
    return;
  }

  console.log("profileData", profileData);

  return (
    <>
      {data && data[0] && (
        <>
          <IndividualMap individual_geojson_data={data[0] as Course} />
          <GoogleMap geojson_data={data[0]} profileData={profileData} />
        </>
      )}
    </>
  );
}
