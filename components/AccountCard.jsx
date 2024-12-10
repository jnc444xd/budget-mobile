import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { signOut } from "../firebase/auth";
import { useGlobalContext } from "../context/GlobalProvider";

const AccountCard = ({ user, lease }) => {
    const { logout } = useGlobalContext();

    const handleLogout = async () => {
        await logout();
        router.replace("/sign-in");
    };

    return (
        <View
            className="w-full rounded-3xl p-6"
            style={{
                backgroundColor: "rgba(31, 47, 61, 0.9)",
                // shadowColor: "white",
                // shadowOffset: { width: 0, height: 5 },
                // shadowOpacity: 0.5,
                // shadowRadius: 15,
                // elevation: 10,
            }}
        >
            <Text className="flex-1 p-2 text-2xl text-[#C3B299] font-psemibold">
                {user ? user.fullName : null}
            </Text>
            <Text className="flex-1 p-2 text-lg text-white font-psemibold">
                Unit {user ? user.unit : null}
            </Text>
            <Text className="flex-1 p-2 text-lg text-white font-psemibold">
                Lease Term
            </Text>
            <Text className="flex-1 ml-2 text-md text-gray-400 font-pregular">
                {lease ? `${lease.startDate} - ${lease.endDate}` : null}
            </Text>
            <View className="flex-row justify-center items-center w-full mt-4">
                <TouchableOpacity
                    onPress={handleLogout}
                    className="w-full pb-2 pt-4"
                >
                    <Text className="text-base text-[#FFA500] text-center font-psemibold">Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
};

export default AccountCard;