"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

type User = {
  email?: string;
  id?: string;
};

const InputName: React.FC<{ user: User }> = ({ user }) => {
  const supabase = createClient();
  const sendName = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, name: name })
      .select();

    console.log(data);
  };
  const [name, setName] = useState("");
  return (
    <div>
      <label
        htmlFor="names"
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        名前を入力してください
      </label>
      <input
        type="text"
        id="names"
        onChange={(e) => setName(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <button
        onClick={sendName}
        className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        送信
      </button>
    </div>
  );
};

export default InputName;
