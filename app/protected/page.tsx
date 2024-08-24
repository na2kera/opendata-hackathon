import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import GoogleMap from "@/components/GoogleMap";
import InputName from "@/components/InputName";

export default async function ProtectedPage() {
  const supabase = createClient();

  const { data: geojson_data, error } = await supabase
    .from("geojson_data")
    .select("geo_json");
  // console.log("geo_json", geojson_data);

  if (error) {
    console.error("Error fetching data:", error);
    // エラー処理をここに追加
  }

  //profilesテーブルにuser_idが存在するか確認
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id");
  console.log("profiles", profiles);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  //uuidがprofilesテーブルするか否かを判定
  const isProfileExist = profiles?.some((profile) => profile.id === user?.id);

  console.log("isProfileExist", isProfileExist);

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center">
          This is a protected page that you can only see as an authenticated
          user
        </div>
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
            <DeployButton />
            <AuthButton />
          </div>
        </nav>
      </div>


      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="py-10">
          <div className="space-y-8">
            <InputName user={user} isProfileExist={isProfileExist} />
               {/* <GoogleMap geojson_data={geojson_data} /> */}
          </div>

        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  );
}
