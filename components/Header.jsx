import { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from "react-native";
import { router } from "expo-router";
import { icons, images } from "../constants";
import { useGlobalContext } from "../context/GlobalProvider";
import { useNotification } from "../context/NotificationProvider";
import { getUnreadNotifications } from "../firebase/database";

const Header = ({ greeting, title, back, open }) => {
    const { user } = useGlobalContext();
    const { notifLength } = useNotification();

    return (
        <View className="flex w-[100%] justify-start bg-transparent space-y-6">
            {
                !back ?
                    <View className="flex items-center justify-center">
                        <Text className="text-white text-lg font-plight p-2">CLYDE</Text>
                        <View
                            className="flex-row space-x-3"
                            style={{ position: "absolute", top: 0, right: 0 }}
                        >
                            {/* <TouchableOpacity
                                onPress={() => router.push("/account")}
                                className="flex flex-row justify-center items-center bg-transparent mt-2"
                            >
                                <Image
                                    source={images.logoNoText}
                                    resizeMode="contain"
                                    className="w-[25px] h-[25px]"
                                />
                            </TouchableOpacity> */}
                            <TouchableOpacity
                                onPress={open}
                                className="flex flex-row justify-center items-center bg-transparent mr-4 mt-2"
                            >
                                <Image
                                    source={icons.notification}
                                    resizeMode="contain"
                                    className="w-[25px] h-[25px]"
                                />
                                {notifLength > 0 && (
                                    <View
                                        style={{
                                            position: "absolute",
                                            top: -4,
                                            right: -6,
                                            backgroundColor: "#BC4F36",
                                            borderRadius: 8,
                                            width: 16,
                                            height: 16,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: "white",
                                                fontSize: 10,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {notifLength}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                    :
                    <View className="flex items-center justify-center">
                        <Text className="text-white text-lg font-plight p-2">CLYDE</Text>
                        <View
                            className="flex-row"
                            style={{ position: "absolute", top: 3, left: 0 }}
                        >
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-[40px] rounded-xl flex flex-row justify-center items-center bg-transparent p-1 ml-1"
                            >
                                <Image
                                    source={icons.back}
                                    style={{ backgroundColor: 'transparent', width: 25, height: 25 }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
            }
            {
                greeting ?
                    <>
                        <Text className="text-2xl text-[#EDEBD7] font-psemibold bg-transparent self-start ml-5 mt-6 mb-4">Welcome Home,{"\n"}{greeting}</Text>
                    </>
                    :
                    null
            }
            {
                title ?
                    <Text className="text-2xl text-[#FFF] font-psemibold bg-transparent self-center mb-6 mt-6">{title}</Text>
                    :
                    null
            }
        </View>
    )
};

export default Header;