import { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    Image,
    RefreshControl,
    TouchableOpacity,
    Modal,
    Button,
    Switch,
    TextInput,
    Alert,
    ImageBackground
} from "react-native";
import { images, icons } from "../../constants";
import { CustomButton } from "../../components";
import { getAllMaintenanceRequests, updateMaintenanceRequest } from "../../firebase/database";
import { useGlobalContext } from "../../context/GlobalProvider";
import LoadingScreen from "../../components/LoadingScreen";

const AllMaintenanceRequests = () => {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { user } = useGlobalContext();

    const fetchData = async () => {
        try {
            const fetchedData = await getAllMaintenanceRequests();
            const completeRequests = fetchedData.filter((request) => request.isComplete);

            const groupedData = completeRequests.reduce((acc, item) => {
                (acc[item.unit] = acc[item.unit] || []).push(item);
                return acc;
            }, {});

            setMaintenanceData(groupedData);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Failed to fetch data: ', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
    };

    const openDetailsModal = (selectedID) => {
        setCurrentItem(selectedID);
        setDetailsModalVisible(true);
    };

    const renderSelectedRequestDetails = () => {
        let selectedItem;
        Object.values(maintenanceData).forEach(requests => {
            const foundItem = requests.find(request => request.id === currentItem);
            if (foundItem) selectedItem = foundItem;
        });

        if (!selectedItem) return null;

        const { subject, scheduled, urgent, description, location, arrivalWindow, arrivalNotes } = selectedItem;
        return (
            <>
                <Text className="text-xl text-black font-pbold my-2">{subject}</Text>
                <Text className="text-lg text-[#FFA500] font-pbold my-2">{scheduled ? "Scheduled!" : "Scheduling In Progress"}</Text>
                {arrivalWindow && <Text className="text-base text-black font-pregular my-2 self-start">Arrival Window: {arrivalWindow}</Text>}
                {arrivalNotes && <Text className="text-base text-black font-pregular my-2 self-start">Notes: {arrivalNotes}</Text>}
                <Text className="text-base text-black font-pregular my-2 self-start">Urgent: {urgent ? 'Yes' : 'No'}</Text>
                <Text className="text-base text-black font-pregular my-2 self-start">Description: {description}</Text>
                <Text className="text-base text-black font-pregular my-2 self-start">Location: {location}</Text>
            </>
        );
    };

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    };

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            {
                detailsModalVisible &&
                <Modal
                    transparent={true}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setDetailsModalVisible(!detailsModalVisible);
                    }}
                >
                    <ScrollView
                        className="h-full"
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
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
                        <View className="flex-col justify-center mt-12 mx-5 bg-white rounded-lg p-9 items-center shadow-lg" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                            <View className="w-full self-end mb-4">
                                <TouchableOpacity
                                    onPress={() => setDetailsModalVisible(!detailsModalVisible)}
                                    className="bg-white"
                                >
                                    <Image
                                        source={icons.close}
                                        resizeMode="contain"
                                        className="w-[40px] h-[40px]"
                                    />
                                </TouchableOpacity>
                            </View>
                            {renderSelectedRequestDetails()}
                        </View>
                    </ScrollView>
                </Modal>
            }
            <View className="flex-row justify-start w-full mt-2 mb-4">
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
            <Text className="text-2xl font-semibold text-[#C3B299] mt-6 font-psemibold ml-4">
                request history
            </Text>
            <ScrollView
                className="flex-1 mx-4 h-full"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#FFF", "#FFF"]} // Android
                        tintColor="#FFF" // iOS
                        title="Loading..." // iOS
                        titleColor="#000" // iOS
                    />
                }
            >
                {Object.entries(maintenanceData).map(([unit, requests]) => (
                    <View key={unit} className="flex items-start justify-center">
                        <Text className="text-xl font-pbold text-[#C3B299] mt-6 mb-2">{`Unit ${unit}`}</Text>
                        {requests.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => openDetailsModal(item.id)}
                                className="w-full"
                            >
                                <View className="flex-row border border-gray-500 rounded-2xl mb-2">
                                    <Text className="flex-1 p-2 text-center text-gray-500 font-psemibold">{item.createdAt}</Text>
                                    <Text className="flex-1 p-2 text-center text-white font-psemibold">{item.subject}</Text>
                                    <Text className="flex-1 p-2 text-center text-[#FFA500] font-psemibold">{item.invoicePaid ? 'Invoice Paid' : 'Invoice Pending'}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    )
};

export default AllMaintenanceRequests;