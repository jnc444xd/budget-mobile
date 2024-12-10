import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useGlobalContext } from "../../../context/GlobalProvider";

const HomeLayout = () => {
    const { loading, isLogged } = useGlobalContext();

    if (!loading && !isLogged) return <Redirect href="/sign-in" />;

    return (
        <>
            <Stack>
                <Stack.Screen
                    name="home"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="createMessage"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
            <StatusBar backgroundColor="#161622" style="light" />
        </>
    );
};

export default HomeLayout;