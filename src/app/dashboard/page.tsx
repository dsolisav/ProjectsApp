"use client";
import { getUserData } from "@/lib/utils";
import * as React from "react";
import { useRouter, redirect } from "next/navigation";
import PMDashboard from "@/components/PMDashboard";
import ClientDashboard from "@/components/ClientDashboard";
import DesignerDashboard from "@/components/DesignerDashboard";
import { useToast } from "@/hooks/use-toast"

function Dashboard() {
  const router = useRouter();
  const { toast } = useToast()
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    async function fetchUser() {
      const userData = await getUserData();
      setUser(userData);
      if (!userData || userData.role !== "authenticated") {
        
        router.push("/");
        toast({
          title: "You are not logged in.",
          description: "To access the dashboard, please log in or sign up first.",
        })
      }
    }
    fetchUser();
  }, []);

  return (
    <div>
      {user != null && user.user_metadata.role == "project_manager" ? (
        <PMDashboard />
      ) : user != null && user.user_metadata.role == "client" ? (
        <ClientDashboard />
      ) : user != null && user.user_metadata.role == "designer" ? (
        <DesignerDashboard />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Dashboard;
