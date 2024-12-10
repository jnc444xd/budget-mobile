import { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    Image,
    RefreshControl,
    Modal,
    Switch,
    TextInput,
    Alert,
    ImageBackground,
    TouchableOpacity
} from "react-native";
import Toast from 'react-native-toast-message'
import { images, icons } from "../../constants";
import { CustomButton } from "../../components";
import { getAllMaintenanceRequests, updateMaintenanceRequest, deleteMaintenanceRequest } from "../../firebase/database";
import { useGlobalContext } from "../../context/GlobalProvider";
import LoadingScreen from "../../components/LoadingScreen";

const UpdateRequests = () => {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [form, setForm] = useState({
        scheduled: false,
        arrivalWindow: "",
        arrivalNotes: "",
        invoicePaid: false
    });
    const [isScheduled, setIsScheduled] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const { user } = useGlobalContext();

    const toggleScheduled = () => setIsScheduled(previousState => !previousState);
    const togglePaid = () => setIsPaid(previousState => !previousState);
    const toggleComplete = () => setIsComplete(previousState => !previousState);

    const fetchData = async () => {
        try {
            const fetchedData = await getAllMaintenanceRequests();
            const incompleteRequests = fetchedData.filter((request) => !request.isComplete);

            const groupedData = incompleteRequests.reduce((acc, item) => {
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


    const openUpdateModal = (selectedID) => {
        setCurrentItem(selectedID);
        setUpdateModalVisible(true);
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

        const { subject, scheduled, urgent, description, location, availability, media, arrivalWindow, arrivalNotes } = selectedItem;
        return (
            <>
                <Text className="text-xl text-black font-pbold my-2">{subject}</Text>
                <Text className="text-lg text-[#FFA500] font-pbold my-2">{scheduled ? "Scheduled!" : "Scheduling In Progress"}</Text>
                {arrivalWindow && <Text className="text-base text-black font-pregular my-2 self-start">Arrival Window: {arrivalWindow}</Text>}
                {arrivalNotes && <Text className="text-base text-black font-pregular my-2 self-start">Notes: {arrivalNotes}</Text>}
                <Text className="text-base text-black font-pregular my-2 self-start">Urgent: {urgent ? 'Yes' : 'No'}</Text>
                <Text className="text-base text-black font-pregular my-2 self-start">Description: {description}</Text>
                <Text className="text-base text-black font-pregular my-2 self-start">Location: {location}</Text>
                <Text className="text-base text-black font-pregular my-2 self-start">
                    Availability:
                </Text>
                <Text className="text-base text-black font-pregular my-2 self-start">
                    {Object.entries(availability)
                        .map(([date, slots]) => `${date}\n${slots.join('\n')}`)
                        .join('\n\n')}
                </Text>
                <Text className="text-base text-black font-pregular my-2 self-start">Attachments: </Text>
                {
                    media.length > 0 ?
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-row">
                            {media.map((item, index) => (
                                <View key={index}>
                                    <Image
                                        source={{ uri: item }}
                                        style={{ width: 200, height: 200, margin: 10 }}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        :
                        <Text>None</Text>
                }
            </>
        );
    };

    const handleDelete = (requestID) => {
        try {
            deleteMaintenanceRequest(requestID);
            console.log("Maintenance request deleted successfully");
            setUpdateModalVisible(false);
        } catch (error) {
            console.error("Failed to delete maintenance request: ", error);
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

    const submit = async (updateID) => {
        if (form.arrivalWindow === "" && form.arrivalNotes === "") {
            Alert.alert("Error", "Please fill in at least one field");
            return;
        }

        setIsLoading(true);

        try {
            const updateData = {
                arrivalWindow: form.arrivalWindow,
                arrivalNotes: form.arrivalNotes,
                scheduled: isScheduled,
                invoicePaid: isPaid,
                isComplete: isComplete
            };
            const result = await updateMaintenanceRequest(updateID, updateData);

            if (result) {
                Toast.show({
                    type: "success",
                    text1: "Maintenance request update successful!"
                });
                setUpdateModalVisible(false);
                setIsLoading(false);
                fetchData();
            }
        } catch (error) {
            setIsLoading(false);
            setUpdateModalVisible(false);
            Toast.show({
                type: "error",
                text1: "Error occurred..."
            });
        } finally {
            setIsLoading(false);
            setUpdateModalVisible(false);
        }
    };

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    };

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            {
                updateModalVisible &&
                <Modal
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setUpdateModalVisible(!updateModalVisible);
                    }}
                >
                    <ScrollView>
                        <View style={{ marginTop: 50, marginHorizontal: 20, backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "start", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                            <View className="w-full self-end mb-4">
                                <TouchableOpacity
                                    onPress={() => setUpdateModalVisible(!updateModalVisible)}
                                    className="bg-white"
                                >
                                    <Image
                                        source={icons.close}
                                        resizeMode="contain"
                                        className="w-[40px] h-[40px]"
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ marginBottom: 20, textAlign: "center" }} className="font-pbold text-xl self-center">Update Maintenance Request</Text>
                            <View className={`space-y-2`}>
                                <Text className="text-base text-black font-pmedium">Arrival Window</Text>
                                <View className="w-full h-16 px-4 bg-white rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
                                    <TextInput
                                        className="flex-1 text-black font-psemibold text-base"
                                        value={form.arrivalWindow}
                                        placeholder="Enter Here..."
                                        placeholderTextColor="black"
                                        onChangeText={(e) => setForm({ ...form, arrivalWindow: e })}
                                    />
                                </View>
                            </View>
                            <View className="space-y-2 mt-4">
                                <Text className="text-base text-black font-pmedium">Arrival Notes</Text>
                                <View className="w-full h-16 px-4 bg-white rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
                                    <TextInput
                                        className="flex-1 text-black font-psemibold text-base"
                                        value={form.arrivalNotes}
                                        placeholder="Enter Here..."
                                        placeholderTextColor="black"
                                        onChangeText={(e) => setForm({ ...form, arrivalNotes: e })}
                                    />
                                </View>
                            </View>
                            <View>
                                <Text className="text-[16px] text-black mt-6 font-psemibold">Scheduled?{"\n"}</Text>
                                <Switch
                                    trackColor={{ false: "#767577", true: "#767577" }}
                                    thumbColor={isScheduled ? "#3DAA52" : "#f4f3f4"}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={toggleScheduled}
                                    value={isScheduled}
                                />
                            </View>
                            <View>
                                <Text className="text-[16px] text-black mt-6 font-psemibold">Invoice Paid?{"\n"}</Text>
                                <Switch
                                    trackColor={{ false: "#767577", true: "#767577" }}
                                    thumbColor={isPaid ? "#3DAA52" : "#f4f3f4"}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={togglePaid}
                                    value={isPaid}
                                />
                            </View>
                            {
                                isPaid ?
                                    <View>
                                        <Text className="text-[16px] text-black mt-6 font-psemibold">Completed?{"\n"}</Text>
                                        <Switch
                                            trackColor={{ false: "#767577", true: "#767577" }}
                                            thumbColor={isComplete ? "#3DAA52" : "#f4f3f4"}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={toggleComplete}
                                            value={isComplete}
                                        />
                                    </View>
                                    :
                                    null
                            }
                            <CustomButton
                                title="Submit"
                                handlePress={() => submit(currentItem)}
                                containerStyles="mt-6 w-[150px] mb-2 self-center"
                            />
                            <CustomButton
                                title="Delete"
                                handlePress={() => deleteConfirmation(currentItem)}
                                containerStyles="w-[150px] self-center"
                            />
                        </View>
                    </ScrollView>
                </Modal>
            }
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
            <Text className="text-2xl font-semibold text-[#C3B299] mt-6 mb-4 font-psemibold ml-4">
                maintenance requests
            </Text>
            <ScrollView
                className="flex-1 p-4 h-full"
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
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                    <View className="flex-column w-full">
                        {Object.entries(maintenanceData).map(([unit, requests]) => (
                            <View key={unit} className="flex-1 w-full">
                                <Text className="text-xl font-pbold text-[#C3B299] mb-2">{`Unit ${unit}`}</Text>
                                {requests.map((item, index) => (
                                    <View key={index} className="flex-row border border-gray-500 rounded-2xl p-1 mb-2">
                                        <Text className="flex-1 p-2 text-center text-white font-psemibold">
                                            {item.subject}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => openDetailsModal(item.id)}
                                        >
                                            <Text className="text-[#00E6FF] font-psemibold p-2">Details</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => openUpdateModal(item.id)}
                                        >
                                            <Text className="text-[#F9C74F] font-psemibold p-2">Update</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    )
};

export default UpdateRequests;