import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { CustomButton } from "../../components";
import { images } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import LogoutButton from "../../components/LogoutButton";
import LoadingScreen from "../../components/LoadingScreen";

const AdminControls = () => {
    const { user } = useGlobalContext();

    const isAdmin = user ? user.isAdmin : false;

    if (!user) {
        return <LoadingScreen />;
    }

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            <View className="flex-row justify-start w-full ml-6">
                <TouchableOpacity onPress={() => router.push("/account")}>
                    <Image
                        source={images.logoNoText}
                        resizeMode="contain"
                        className="w-[100px] h-[100px] mt-10 mb-2"
                    />
                </TouchableOpacity>
            </View>
            <Text className="font-pmedium text-2xl text-white mx-6 my-6">
                Admin Control Panel
            </Text>
            <ScrollView className="w-full">
                <View className="w-[95%] h-full flex-row flex-wrap mx-auto">
                    {isAdmin && (
                        <>
                            <CustomButton
                                title="Chatrooms"
                                handlePress={() => router.push("/adminChatSelect")}
                                containerStyles="w-[45%] m-1 p-2 min-h-[100px]"
                            />
                            <CustomButton
                                title="Active Requests"
                                handlePress={() => router.push("/updateMaintenanceRequest")}
                                containerStyles="w-[45%] m-1 p-2 min-h-[100px]"
                            />
                            <CustomButton
                                title="Request History"
                                handlePress={() => router.push("/allMaintenanceRequests")}
                                containerStyles="w-[45%] m-1 p-2 min-h-[100px]"
                            />
                            <CustomButton
                                title="Payment Lists"
                                handlePress={() => router.push("/updatePaymentList")}
                                containerStyles="w-[45%] m-1 p-2 min-h-[100px]"
                            />
                            <CustomButton
                                title="New Announcement"
                                handlePress={() => router.push("/createNotice")}
                                containerStyles="w-[45%] m-1 p-2 min-h-[100px]"
                            />
                            <CustomButton
                                title="New Lease"
                                handlePress={() => router.push("/createLease")}
                                containerStyles="w-[45%] m-1 p-2 min-h-[100px]"
                            />
                            <CustomButton
                                title="New Tenant"
                                handlePress={() => router.push("/sign-up")}
                                containerStyles="w-[45%] m-1 p-2 min-h-[100px]"
                            />
                        </>
                    )}
                    <CustomButton
                        title="Go Back Home"
                        handlePress={() => router.dismiss(1)}
                        containerStyles="w-[45%] m-1 p-2 min-h-[100px]"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminControls;