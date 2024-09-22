import { supabase} from "@/lib/supabase";

function Dashboard() {
  const setNewUser = async () => {
    const { data, error } = await supabase.from("users").insert({
      email: "pruebasupabase@test.com",
      role: "client",
      username: "usuarioprueba",
    });
    if (data) console.log(data);
    if (error) console.log(error);
  };
  setNewUser()

  return <div>Dashboard</div>;
}

export default Dashboard;
