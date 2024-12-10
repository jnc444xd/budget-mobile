import { useState, useEffect, useRef } from "react";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import {
    View,
    Text,
    ScrollView,
    Image,
    RefreshControl,
    Modal,
    ImageBackground,
    TouchableOpacity,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
    Dimensions,
    Animated,
    StyleSheet,
    FlatList,
    Easing
} from "react-native";
import Toast from 'react-native-toast-message';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";
import { images, icons } from "../../../constants";
import { CustomButton } from "../../../components";
import {
    getMaintenanceRequestsByUnit,
    deleteMaintenanceRequest,
    getUnreadNotifications,
    markNotificationAsRead
} from "../../../firebase/database";
import { useGlobalContext } from "../../../context/GlobalProvider";
import Background from "../../../components/Background";
import Header from "../../../components/Header";
import MaintenanceCard from "../../../components/MaintenanceCard";
import LoadingScreen from "../../../components/LoadingScreen";
import ImageButton from "../../../components/ImageButton";
import Alerts from "../../../components/Alerts";

// const screenWidth = Dimensions.get("window").width;

const Overview = ({ route }) => {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [selectedRequestID, setSelectedRequestID] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [arrivalWindow, setArrivalWindow] = useState(null);
    const [arrivalNotes, setArrivalNotes] = useState(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    // const [notifications, setNotifications] = useState([]);
    // const [notifLength, setNotifLength] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { user } = useGlobalContext();
    const unitNumber = user ? user.unit : null;
    // const params = useLocalSearchParams();
    // const user = params;
    // const unitNumber = user ? user.unit : null;

    const pathname = usePathname();

    const fetchData = async () => {
        if (!unitNumber) return;

        try {
            const fetchedData = await getMaintenanceRequestsByUnit(unitNumber);
            const incompleteRequests = fetchedData.filter((request) => !request.isComplete);
            const sortedData = incompleteRequests.sort((a, b) => new Date(a.timeStamp) - new Date(b.timestamp));
            setMaintenanceData(sortedData);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Failed to fetch data: ', error);
        }
    };

    // const fetchUnreadNotifications = async (accountID) => {
    //     if (!accountID) {
    //         console.error("Account ID is required");
    //         return;
    //     }

    //     try {
    //         const notificationData = await getUnreadNotifications(accountID);
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

    useEffect(() => {
        fetchData();
        // fetchUnreadNotifications(user.accountID);
        // if (user?.accountID) {
        //     fetchUnreadNotifications(user.accountID);
        // };
    }, []);

    const handleDelete = (requestID) => {
        try {
            deleteMaintenanceRequest(requestID);
            setModalVisible(false);

            if (unitNumber) {
                fetchData();
            };

            console.log("Maintenance request deleted successfully");
            Toast.show({
                type: "success",
                text1: "Successfully deleted maintenance request! 👍"
            });
        } catch (error) {
            console.error("Failed to delete maintenance request: ", error);
            Toast.show({
                type: "error",
                text1: "Failed to delete maintenance request. 😕"
            });
        }
    };

    const deleteConfirmation = (requestID) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this item?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed")
                },
                {
                    text: "OK",
                    onPress: () => handleDelete(requestID)
                }
            ]
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
    };

    const openModal = (window, notes, id) => {
        setSelectedRequestID(id);
        setArrivalWindow(window);
        setArrivalNotes(notes);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedRequestID(null);
        setArrivalWindow(null);
        setArrivalNotes(null);
    };

    const handleCreateButton = () => {
        router.push("/create");
    };

    const handleViewAllButton = () => {
        router.push("/completed");
    };

    // const handleNotificationPress = async (accountID, notificationIDs, location) => {
    //     if (!accountID || !notificationIDs || notificationIDs.length === 0) {
    //         console.error("Invalid input for handling notifications");
    //         return;
    //     }

    //     try {
    //         if (Array.isArray(notificationIDs)) {
    //             const markAllAsReadPromises = notificationIDs.map((id) =>
    //                 markNotificationAsRead(accountID, id)
    //             );
    //             await Promise.all(markAllAsReadPromises);
    //         } else {
    //             await markNotificationAsRead(accountID, notificationIDs);
    //         }

    //         if (user?.accountID) {
    //             await fetchUnreadNotifications(user?.accountID);
    //         }

    //         router.push(`/${location}`);
    //     } catch (error) {
    //         console.error("Error handling notifications:", error);
    //     } finally {
    //         toggleModal();
    //     }
    // };

    // const slideAnim = useRef(new Animated.Value(screenWidth)).current;

    // const toggleModal = () => {
    //     if (isModalOpen) {
    //         Animated.timing(slideAnim, {
    //             toValue: screenWidth,
    //             duration: 300,
    //             easing: Easing.ease,
    //             useNativeDriver: true,
    //         }).start(() => setIsModalOpen(false));
    //     } else {
    //         Animated.timing(slideAnim, {
    //             toValue: 0,
    //             duration: 300,
    //             easing: Easing.ease,
    //             useNativeDriver: true,
    //         }).start(() => setIsModalOpen(true));
    //     }
    // };

    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
    };

    useEffect(() => {
        setIsModalOpen(false);
    }, [pathname]);

    // const gesture = Gesture.Pan()
    //     .onEnd(() => {
    //         runOnJS(toggleModal)();
    //     });

    // const typeIcon = {
    //     "maintenance": {
    //         icon: icons.update,
    //         bgColor: "#FFD166",
    //     },
    //     "chat": {
    //         icon: icons.message,
    //         bgColor: "#50B3F0",
    //     },
    //     "announcement": {
    //         icon: icons.megaphone,
    //         bgColor: "#EF476F",
    //     },
    //     "community-board": {
    //         icon: icons.pin,
    //         bgColor: "#8338EC",
    //     },
    // };

    const renderSelectedRequestDetails = () => {
        const item = maintenanceData.find(({ id }) => id === selectedRequestID);
        if (!item) return null;

        return (
            <>
                <Text className="text-2xl text-white font-pbold my-2">{item.subject}</Text>
                <Text className="text-base text-[#FFA500] font-pmedium mb-4">{item.scheduled ? "Scheduled!" : "Scheduling In Progress"}</Text>
                <View
                    className="flex flex-col items-center w-[95%] rounded-2xl p-8 my-2"
                    style={{
                        backgroundColor: "rgba(31, 47, 61, 0.9)",
                        // shadowColor: "white",
                        // shadowOffset: { width: 0, height: 5 },
                        // shadowOpacity: 0.2,
                        // shadowRadius: 8,
                        // elevation: 10,
                        maxHeight: "65%",
                    }}
                >
                    <ScrollView
                        horizontal={false}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            width: "100%",
                        }}
                    >
                        {
                            arrivalWindow &&
                            <>
                                <Text className="text-base text-white font-pmedium my-2 self-start">Arrival Window:</Text>
                                <Text className="text-base text-[#A0A8B5] font-pmedium my-2 self-start">{arrivalWindow}</Text>
                            </>
                        }
                        {
                            arrivalNotes &&
                            <>
                                <Text className="text-base text-white font-pmedium my-2 self-start">Notes:</Text>
                                <Text className="text-base text-[#A0A8B5] font-pmedium my-2 self-start">{arrivalNotes}</Text>
                            </>
                        }
                        <Text className="text-base text-white font-pmedium my-2 self-start">
                            Urgent: <Text className="text-[#A0A8B5]">{item.urgent ? 'Yes' : 'No'}</Text>
                        </Text>
                        <Text className="text-base text-white font-pmedium my-2 self-start">
                            Description: <Text className="text-[#A0A8B5]">{item.description}</Text>
                        </Text>
                        <Text className="text-base text-white font-pmedium my-2 self-start">
                            Location: <Text className="text-[#A0A8B5]">{item.location}</Text>
                        </Text>
                        <Text className="text-base text-white font-pmedium my-2 self-start">
                            Availability:
                        </Text>
                        <Text className="text-base text-[#A0A8B5] font-pmedium my-2 self-start">
                            {Object.entries(item.availability || {})
                                .map(([date, slots]) =>
                                    `${date}\n${Array.isArray(slots) && slots.length > 0 ? slots.join('\n') : 'No available time slots'}`
                                )
                                .join('\n\n')}
                        </Text>
                        <Text className="text-base text-white font-medium my-2 self-start">Photo Attachments:</Text>
                        <View className="w-full flex flex-row justify-center space-x-2">
                            {item.media.map((photo, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: photo }}
                                    className="w-[100px] h-[100px]"
                                />
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </>
        );
    };

    if (isLoading || !user) {
        return (
            <LoadingScreen />
        )
    }

    return (
        <SafeAreaView edges={["left", "right", "bottom", "top"]} className="flex-1 bg-[#09141d]">
            {
                modalVisible &&
                <Modal
                    transparent={true}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            width: "100%",
                        }}>
                        <View
                            className="w-full flex flex-col justify-center rounded-lg px-4 pt-4 items-center shadow-lg bg-[#09141d]"
                        >
                            <View className="w-full flex items-end">
                                <TouchableOpacity
                                    onPress={() => setModalVisible(!modalVisible)}
                                    className="bg-transparent"
                                >
                                    <Image
                                        source={icons.close}
                                        resizeMode="contain"
                                        className="w-[40px] h-[40px] mr-4"
                                    />
                                </TouchableOpacity>
                            </View>
                            {renderSelectedRequestDetails()}
                            <TouchableOpacity
                                onPress={() => deleteConfirmation(selectedRequestID)}
                                className="bg-[#E63946] rounded-xl flex justify-center items-center mt-5 mb-4"
                            >
                                <Text className="text-base text-white font-pbold p-3">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            }
            <Alerts isModalOpen={isModalOpen} toggleModal={toggleModal} />
            {/* <GestureDetector gesture={gesture}>
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
                                                className="flex justify-center items-center p-1 rounded-md w-[40] h-[40] mr-4"
                                                style={{ backgroundColor: typeConfig.bgColor || "#333" }}
                                            >
                                                <Image
                                                    source={typeConfig.icon || icons.defaultNotification}
                                                    resizeMode="contain"
                                                    className="w-[25px] h-[25px]"
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
            </GestureDetector> */}
            <Header
                open={toggleModal}
            />
            <View className="bg-transparent flex flex-col w-full h-full mt-6">
                <View className="w-[90%] self-center flex-row flex-wrap justify-between items-center">
                    <View>
                        <Text className="text-2xl text-[#FFF] font-psemibold text-left ml-2 mt-2">maintenance</Text>
                        <Text className="text-2xl text-[#C3B299] font-psemibold text-left ml-2 mb-2">active list</Text>
                    </View>
                    <View className="flex-row mx-auto">
                        <ImageButton
                            icon={icons.create}
                            title="Create"
                            handlePress={handleCreateButton}
                        />
                        <ImageButton
                            icon={icons.history}
                            title="View All"
                            handlePress={handleViewAllButton}
                        />
                        {/* <TouchableOpacity
                            onPress={() => handleCreateButton()}
                            className="bg-[#FFA500] rounded-2xl p-3 h-[60px] w-[70] flex justify-center items-center"
                        >
                            <Text className="text-white text-xs font-psemibold text-center">Create{"\n"}New</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleViewAllButton()}
                            className="bg-[#FFA500] rounded-2xl p-3 h-[60px] w-[70px] flex justify-center items-center"
                        >
                            <Text className="text-white text-xs font-psemibold text-center">View{"\n"}All</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FFF", "#FFF"]} // Android
                            tintColor="#FFF" // iOS
                            titleColor="#000" // iOS
                        />
                    }
                    scrollEnabled={scrollEnabled}
                >
                    <View className="flex-col items-center w-full">
                        {
                            maintenanceData &&
                            maintenanceData.length > 0 &&
                            maintenanceData.map((item, index) => (
                                <MaintenanceCard
                                    key={index}
                                    id={item.id}
                                    createdAt={item.createdAt}
                                    subject={item.subject}
                                    scheduled={item.scheduled}
                                    arrivalWindow={item.arrivalWindow}
                                    arrivalNotes={item.arrivalNotes}
                                    openModal={openModal}
                                    confirmDelete={deleteConfirmation}
                                    setScrollEnabled={setScrollEnabled}
                                />
                            ))
                        }
                        {
                            maintenanceData &&
                            maintenanceData.length === 0 &&
                            <View className="flex-row w-full justify-center">
                                <Text className="flex-1 p-4 pb-8 text-center text-white font-pregular">
                                    No active requests
                                </Text>
                            </View>
                        }
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    modalContainer: {
        position: "absolute",
        top: 95,
        right: 0,
        width: "70%",
        backgroundColor: "rgba(195, 178, 153, 1)",
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        paddingTop: 10,
        paddingLeft: 10,
        paddingBottom: 10,
        zIndex: 100,
    },
    notificationHeader: {
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 0,
        padding: 15,
        marginBottom: 1,
    },
    emptyNotificationHeader: {
        backgroundColor: "rgba(0, 0, 0, 0.4)",
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
        backgroundColor: "rgba(0, 0, 0, 0.4)",
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
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 0,
        padding: 10,
        marginBottom: 1,
        minHeight: 55,
    },
    emptyContainer: {
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 0,
        padding: 10,
    }
});

export default Overview;