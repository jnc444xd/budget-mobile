import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
// import { useGlobalContext } from "../../../context/GlobalProvider";

const MaintenanceLayout = () => {
  // const { loading, isLogged } = useGlobalContext();

  // if (!loading && !isLogged) return <Redirect href="/sign-in" />;
  const params = useLocalSearchParams();

  return (
    <>
      <Stack>
        <Stack.Screen
          name="overview"
          options={{
            headerShown: false,
          }}
          initialParams={params}
        />
        <Stack.Screen
          name="create"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="completed"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default MaintenanceLayout;
