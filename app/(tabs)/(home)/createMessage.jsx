import { useState } from "react";
import { router } from "expo-router";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    Image,
    Keyboard
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message'
import { CustomButton, FormField } from "../../../components";
import { useGlobalContext } from "../../../context/GlobalProvider";
import { addCommunityBoardMessage } from "../../../firebase/database";
import { icons } from "../../../constants";
import Background from "../../../components/Background";
import Header from "../../../components/Header";

const CreateMessage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        subject: "",
        description: "",
    });

    const { user } = useGlobalContext();
    const unitNumber = user ? user.unit : null;
    const creatorID = user ? user.uid : null;
    const name = user ? user.firstName : null;

    const submit = async () => {
        if (form.description === "" || form.subject === "") {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setIsLoading(true);

        try {
            const timeStamp = new Date().toISOString();
            const messageData = {
                unit: unitNumber,
                subject: form.subject,
                description: form.description,
                createdAt: timeStamp,
                creatorID: creatorID,
                name: name,
            };
            const result = await addCommunityBoardMessage(messageData);

            setIsLoading(false);

            if (result) {
                Toast.show({
                    type: "success",
                    text1: "Successfully posted to community board! 🎉"
                });
            }

            router.replace("/home");
        } catch (error) {
            setIsLoading(false);
            console.error("Error", error.message);
            Toast.show({
                type: "error",
                text1: "Oops! An error occurred. Please try again. 😕"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <SafeAreaView edges={["left", "right", "bottom", "top"]} className="flex-1 bg-[#09141d]">
            <GestureDetector gesture={Gesture.Pan().onEnd(dismissKeyboard)}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <SafeAreaView edges={["left", "right", "bottom"]} className="flex-1 bg-transparent">
                        <View className="w-full h-full flex justify-start items-center px-4">
                            <View className="flex w-[100%] justify-start bg-transparent pt-12 space-y-6">
                                <View className="flex-row justify-start w-full">
                                    <TouchableOpacity
                                        onPress={() => router.back()}
                                        className="w-[40px] rounded-xl flex flex-row justify-center items-center bg-transparent p-1 ml-1 mt-1"
                                    >
                                        <Image
                                            source={icons.back}
                                            style={{ backgroundColor: 'transparent', width: 28, height: 28 }}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-2xl text-[#FFA500] font-psemibold bg-transparent self-center mb-2 mt-6">Create New Post</Text>
                            </View>
                            <FormField
                                title="Subject"
                                value={form.subject}
                                handleChangeText={(e) => setForm({ ...form, subject: e })}
                                otherStyles="mt-7"
                            />
                            <FormField
                                title="Description"
                                value={form.description}
                                handleChangeText={(e) => setForm({ ...form, description: e })}
                                otherStyles="mt-7"
                            />
                            {
                                isLoading ?
                                    <View className="w-full flex-row justify-center mt-4">
                                        <Image
                                            source={icons.loading}
                                            className="w-[50] h-[50]"
                                            resizeMode="contain"
                                        />
                                    </View>
                                    :
                                    <View className="w-full flex-row justify-center">
                                        <CustomButton
                                            title="Submit"
                                            handlePress={submit}
                                            containerStyles="mt-10 w-[100]"
                                        />
                                    </View>
                            }
                        </View>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </GestureDetector>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent'
    }
});

export default CreateMessage;