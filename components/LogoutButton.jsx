import React from "react";
import { router } from "expo-router";
import { TouchableOpacity, Image, Alert } from "react-native";
import { signOut } from "../firebase/auth";
import { useGlobalContext } from "../context/GlobalProvider";

const LogoutButton = ({ additionalStyles }) => {
    const { setUser, setIsLogged } = useGlobalContext();

    const handleLogout = () => {
        signOut();

        router.replace("/sign-in");
    };

    return (
        <TouchableOpacity
            onPress={handleLogout}
            className="rounded-xl flex flex-row justify-center items-center bg-[#FF9C01] p-1"
        >
            <Image
                source={require('../assets/icons/logout.png')}
                style={{ backgroundColor: 'transparent', width: 30, height: 30 }}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );
};

export default LogoutButton;