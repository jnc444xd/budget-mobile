import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    ScrollView,
    Text,
    View,
    RefreshControl,
    Image,
    TouchableOpacity,
    Alert,
    Dimensions,
    Animated,
    StyleSheet,
    FlatList,
    Easing,
} from "react-native";
import Toast from 'react-native-toast-message'
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { router, useLocalSearchParams } from "expo-router";
import { images, icons } from "../constants";
import { useGlobalContext } from "../context/GlobalProvider";
import { useNotification } from "../context/NotificationProvider";
import {
    getNotices,
    deleteNotice,
    getAllCommunityBoardMessages,
    deleteCommunityBoardMessage,
    getUnreadNotifications,
    markNotificationAsRead,
} from "../firebase/database";

const screenWidth = Dimensions.get("window").width;

const Alerts = ({ isModalOpen, toggleModal }) => {
    // const [notifications, setNotifications] = useState([]);

    const { user } = useGlobalContext();
    const { notifications, groupedNotifications, fetchUnreadNotifications } = useNotification();

    // const fetchUnreadNotifications = async () => {
    //     if (!user?.accountID) return;

    //     try {
    //         const notificationData = await getUnreadNotifications(user?.accountID);
    //         setNotifLength(notificationData.length);

    //         setNotifications(notificationData);
    //         console.log("Processed Notifications:", notificationData);

    //         return notificationData;
    //     } catch (error) {
    //         console.error("Failed to fetch unread notifications:", error);
    //     }
    // };

    // const processNotifications = (notifications) => {
    //     let chatCount = 0;
    //     const processedNotifications = notifications.reduce((result, item) => {
    //         if (item?.type === "chat") {
    //             chatCount += 1;
    //             return result;
    //         }
    //         result.push(item);
    //         return result;
    //     }, []);

    //     if (chatCount > 0) {
    //         processedNotifications.unshift({
    //             id: "chat-group",
    //             type: "chat",
    //             title: "Chat Notifications",
    //             body: `You have ${chatCount} new messages`,
    //         });
    //     }

    //     return processedNotifications;
    // };

    // const groupedNotifications = processNotifications(notifications);

    // useEffect(() => {
    //     fetchUnreadNotifications();
    // }, [user]);

    // useEffect(() => {
    //     console.log("notifications: ", notifications, "grouped: ", groupedNotifications);
    // }, []);

    const handleNotificationPress = async (accountID, notificationIDs, location) => {
        if (!accountID || !notificationIDs || notificationIDs.length === 0) {
            console.error("Invalid input for handling notifications");
            return;
        }

        try {
            if (Array.isArray(notificationIDs)) {
                const markAllAsReadPromises = notificationIDs.map((id) =>
                    markNotificationAsRead(accountID, id)
                );
                await Promise.all(markAllAsReadPromises);
            } else {
                await markNotificationAsRead(accountID, notificationIDs);
            }

            if (user?.accountID) {
                await fetchUnreadNotifications(user?.accountID);
            }

            router.push(`/${location}`);
        } catch (error) {
            console.error("Error handling notifications:", error);
        } finally {
            toggleModal();
        }
    };

    const slideAnim = useRef(new Animated.Value(screenWidth)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isModalOpen ? 0 : screenWidth,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start();
    }, [isModalOpen]);

    const gesture = Gesture.Pan()
        .onEnd(() => {
            runOnJS(toggleModal)();
        });

    const typeIcon = {
        "maintenance": {
            icon: icons.update,
            bgColor: "#FFD166",
        },
        "chat": {
            icon: icons.message,
            bgColor: "#50B3F0",
        },
        "announcement": {
            icon: icons.megaphone,
            bgColor: "#EF476F",
        },
        "community-board": {
            icon: icons.pin,
            bgColor: "#8338EC",
        },
        "rent": {
            icon: icons.wallet,
            bgColor: "#06D6A0",
        },
    };

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                style={[
                    styles.modalContainer,
                    { transform: [{ translateX: slideAnim }] },
                ]}
            >
                <View>
                    <View style={notifications.length > 0 ? styles.notificationHeader : styles.emptyNotificationHeader}>
                        <Text className={`text-[#FFF] ${notifications.length > 0 ? "text-lg" : "text-base"} font-psemibold`}>
                            {notifications.length > 0 ? "notifications" : "no new notifications"}
                        </Text>
                    </View>
                    <FlatList
                        data={groupedNotifications}
                        keyExtractor={(item, index) => (item?.id ? item.id : `null-${index}`)}
                        renderItem={({ item, index }) => {
                            const isLastItem = index === groupedNotifications.length - 1;
                            const typeConfig = typeIcon[item.type] || {};

                            return item ? (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (item.type !== "chat") {
                                            handleNotificationPress(user?.accountID, item.id, item.nav);
                                        } else if (item.type === "chat") {
                                            const chatNotificationIDs = notifications
                                                .filter((item) => item?.type === "chat")
                                                .map((item) => item.id);
                                            handleNotificationPress(user?.accountID, chatNotificationIDs, "chat");
                                        }
                                    }}
                                >
                                    <View
                                        style={isLastItem ? styles.lastNotificationContainer : styles.notificationContainer}
                                    >
                                        <View
                                            className="flex justify-center items-center p-1 rounded-md w-[35] h-[35] mr-4"
                                            style={{ backgroundColor: typeConfig.bgColor || "#333" }}
                                        >
                                            <Image
                                                source={typeConfig.icon || icons.defaultNotification}
                                                resizeMode="contain"
                                                className="w-[22px] h-[22px]"
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-white text-xs font-psemibold mb-1">{item.title}</Text>
                                            <Text className="text-gray-100 text-xs font-pregular">{item.body}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.notificationContainer} />
                            );
                        }}
                    />
                </View>
            </Animated.View>
        </GestureDetector>
    )
};

const styles = StyleSheet.create({
    modalContainer: {
        position: "absolute",
        top: 95,
        right: 0,
        width: "70%",
        // maxHeight: 360,
        backgroundColor: "rgba(34, 34, 34, 1)",
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        paddingTop: 10,
        paddingLeft: 10,
        paddingBottom: 10,
        zIndex: 100,
    },
    notificationHeader: {
        backgroundColor: "rgba(115, 115, 115, 0.5)",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 0,
        padding: 15,
        marginBottom: 1,
    },
    emptyNotificationHeader: {
        backgroundColor: "rgba(115, 115, 115, 0.5)",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 0,
        padding: 15,
        marginBottom: 1,
    },
    notificationContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(115, 115, 115, 0.5)",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 0,
        padding: 10,
        marginBottom: 1,
        minHeight: 55,
    },
    lastNotificationContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(115, 115, 115, 0.5)",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 0,
        padding: 10,
        marginBottom: 1,
        minHeight: 55,
    },
    emptyContainer: {
        backgroundColor: "rgba(115, 115, 115, 0.5)",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 0,
        padding: 10,
    }
});

export default Alerts;