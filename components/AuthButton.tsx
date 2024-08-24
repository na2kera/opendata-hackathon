import { createClient } from "@/utils/supabase/server";
import { Typography } from "@mui/material";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  //profileを取得する
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();
  console.log("profile", profile);

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    <div className="flex items-center gap-4">
      {profile ? (
        <Typography variant="h6">Hey, {profile.name}!</Typography>
      ) : (
        // TODO: プロフィールを入力するページに遷移する
        <Typography variant="h6">プロフィールを入力してください</Typography>
      )}
      <form action={signOut}>
        <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
    >
      Login
    </Link>
  );
}
