import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useGlobalContext } from "../../context/GlobalProvider";

const AdminLayout = () => {
  const { loading, isLogged, user } = useGlobalContext();

  if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  if (user) {
    if (!loading && !user.isAdmin) return <Redirect href="/home" />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="createNotice"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="createLease"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="updateMaintenanceRequest"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="updatePaymentList"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="adminChatSelect"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="adminChatRoom"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="adminControls"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="allMaintenanceRequests"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default AdminLayout;
