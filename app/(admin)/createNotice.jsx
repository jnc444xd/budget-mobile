import { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image, TouchableOpacity } from "react-native";
import Toast from 'react-native-toast-message'
import { icons } from "../../constants";
import { addNotice } from "../../firebase/database";
import { CustomButton, FormField } from "../../components";
import LoadingScreen from "../../components/LoadingScreen";
import { useGlobalContext } from "../../context/GlobalProvider";

const createNotice = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        message: ""
    });

    const { user } = useGlobalContext();

    const submit = async () => {
        if (form.title === "" || form.message === "") {
            Alert.alert("Error", "Please fill in all fields");
        }

        setIsLoading(true);

        try {
            const timeStamp = new Date().toISOString();
            const noticeData = {
                title: form.title,
                message: form.message,
                createdAt: timeStamp
            };
            const result = await addNotice(noticeData);
            setIsLoading(false);
            Toast.show({
                type: "success",
                text1: "Annoucement posted!"
            });
            router.replace("/home");
        } catch (error) {
            setIsLoading(false);
            Toast.show({
                type: "error",
                text1: "Error occurred..."
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    };

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            <View className="flex w-[100%] justify-start bg-transparent space-y-6">
                <View className="flex-row justify-start w-full">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-[40px] rounded-xl flex flex-row justify-center items-center bg-transparent p-1 ml-1 mt-2 mb-4"
                    >
                        <Image
                            source={icons.back}
                            style={{ backgroundColor: 'transparent', width: 28, height: 28 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
                <Text className="text-2xl text-[#FFA500] font-psemibold bg-transparent self-start mb-2 ml-4">New Announcement</Text>
            </View>
            <ScrollView>
                <View className="w-full flex justify-center h-full px-4">
                    <FormField
                        title="Title"
                        value={form.title}
                        handleChangeText={(e) => setForm({ ...form, title: e })}
                        otherStyles="mt-7"
                    />
                    <FormField
                        title="Message"
                        value={form.message}
                        handleChangeText={(e) => setForm({ ...form, message: e })}
                        otherStyles="mt-7"
                    />
                    <CustomButton
                        title="Save"
                        handlePress={submit}
                        containerStyles="mt-7"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default createNotice;