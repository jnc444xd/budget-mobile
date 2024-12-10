import React, { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import {
    View,
    Text,
    ScrollView,
    Image,
    RefreshControl,
    Modal,
    ImageBackground,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images, icons } from "../../../constants";
import { CustomButton } from "../../../components";
import { getMaintenanceRequestsByUnit } from "../../../firebase/database";
import { useGlobalContext } from "../../../context/GlobalProvider";
import Background from "../../../components/Background";
import Header from "../../../components/Header";
import CompletedCard from "../../../components/CompletedCard";
import LoadingScreen from "../../../components/LoadingScreen";

const Completed = () => {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [selectedRequestID, setSelectedRequestID] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [arrivalWindow, setArrivalWindow] = useState(null);
    const [arrivalNotes, setArrivalNotes] = useState(null);

    const { user, loading, isLogged } = useGlobalContext();
    const unitNumber = user ? user.unit : null;

    const fetchData = async () => {
        if (!unitNumber) return;

        try {
            const fetchedData = await getMaintenanceRequestsByUnit(unitNumber);
            const completeRequests = fetchedData.filter((request) => request.isComplete);
            const sortedData = completeRequests.sort((a, b) => new Date(a.timeStamp) - new Date(b.timestamp));
            setMaintenanceData(sortedData);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Failed to fetch data: ', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
    };

    const openUpdateModal = (window, notes, id) => {
        setSelectedRequestID(id);
        setArrivalWindow(window);
        setArrivalNotes(notes);
        setModalVisible(true);
    };

    const closeUpdateModal = () => {
        setModalVisible(false);
    };

    const renderSelectedRequestDetails = () => {
        const item = maintenanceData.find(({ id }) => id === selectedRequestID);
        if (!item) return null;

        return (
            <>
                <Text className="text-xl text-white font-pbold my-2">{item.subject}</Text>
                <Text className="text-base text-[#FFA500] font-pmedium mb-4">Successfully Completed!</Text>
                <View
                    className="flex flex-col items-center w-[95%] rounded-2xl shadow-lg p-8 mt-2 mb-10"
                    style={{
                        backgroundColor: "rgba(31, 47, 61, 0.9)",
                        shadowColor: "black",
                        shadowOffset: { width: 0, height: 5 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 10,
                    }}
                >
                    <Text className="text-base text-white font-pmedium my-2 self-start">
                        Description: <Text className="text-[#A0A8B5]">{item.description}</Text>
                    </Text>
                    <Text className="text-base text-white font-pmedium my-2 self-start">
                        Location: <Text className="text-[#A0A8B5]">{item.location}</Text>
                    </Text>
                </View>
            </>
        );
    };

    if (isLoading) {
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
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
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
                        </View>
                    </View>
                </Modal>
            }
            <Header
                back={true}
            />
            <View className="w-[90%] self-center">
                <Text className="text-2xl text-[#FFF] font-psemibold text-left ml-2 mt-8">maintenance</Text>
                <Text className="text-2xl text-[#C3B299] font-psemibold text-left ml-2 mb-2">completed list</Text>
            </View>
            <View className="bg-transparent rounded-t-3xl flex flex-col w-full h-full">
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
                >
                    <View className="flex-col items-center w-full mt-2">
                        {maintenanceData && maintenanceData.map((item, index) => (
                            <CompletedCard
                                key={index}
                                id={item.id}
                                createdAt={item.createdAt}
                                subject={item.subject}
                                arrivalWindow={item.arrivalWindow}
                                arrivalNotes={item.arrivalNotes}
                                isComplete={item.isComplete}
                                openModal={openUpdateModal}
                            />
                        ))}
                        {/* {maintenanceData && maintenanceData.map((item, index) => (
                                <View key={index} className="flex-row w-full justify-center">
                                    <Text className="flex-1 p-4 text-center text-white font-pregular">
                                        {item.createdAt}
                                    </Text>
                                    <Text className="flex-1 p-4 text-center text-white font-pregular">
                                        {item.subject}
                                    </Text>
                                    <View className="flex-1 py-2 px-4 text-center text-white">
                                        {item.isComplete ?
                                            <TouchableOpacity
                                                onPress={() => openUpdateModal(item.arrivalWindow, item.arrivalNotes, item.id)}
                                                className="rounded-xl bg-[#FF9C01] p-2"
                                            >
                                                <Text className="text-white text-center font-pregular">See Details</Text>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity
                                                onPress={() => openUpdateModal(item.arrivalWindow, item.arrivalNotes, item.id)}
                                                className="rounded-xl bg-[#FF9C01] p-2"
                                            >
                                                <Text className="text-white text-center font-pregular">In Progress</Text>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                </View>
                            ))} */}
                        {
                            maintenanceData &&
                            maintenanceData.length === 0 &&
                            <View className="flex-row w-full justify-center">
                                <Text className="flex-1 p-4 text-center text-white font-pregular">
                                    No completed requests
                                </Text>
                            </View>
                        }
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
};

export default Completed;