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
    TouchableOpacity,
    Alert,
    ImageBackground,
    TextInput,
} from "react-native";
import Toast from 'react-native-toast-message'
import { images, icons } from "../../constants";
import { CustomButton } from "../../components";
import { getAllLeases, updateRentPaid, updateRentAmount } from "../../firebase/database";
import { useGlobalContext } from "../../context/GlobalProvider";
import LoadingScreen from "../../components/LoadingScreen";

const UpdatePaymentList = () => {
    const [paymentData, setPaymentData] = useState([]);
    const [modalData, setModalData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [paidStatuses, setPaidStatuses] = useState({});
    const [updatedRentAmounts, setUpdatedRentAmounts] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    const { user } = useGlobalContext();

    useEffect(() => {
        fetchAllLeases();
    }, []);

    const fetchAllLeases = async () => {
        setIsLoading(true);

        try {
            const fetchedData = await getAllLeases();

            const monthOrder = {
                "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
                "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
            };

            const groupedPaymentData = fetchedData.reduce((acc, lease) => {
                const paymentsArray = Object.entries(lease.payments)
                    .map(([month, paymentDetails]) => ({
                        month,
                        ...paymentDetails,
                        leaseId: lease.id
                    }))
                    .sort((a, b) => {
                        const yearMonthA = a.month.split(' ');
                        const yearMonthB = b.month.split(' ');
                        const yearA = parseInt(yearMonthA[1], 10);
                        const yearB = parseInt(yearMonthB[1], 10);
                        const monthA = monthOrder[yearMonthA[0]];
                        const monthB = monthOrder[yearMonthB[0]];

                        if (yearA !== yearB) {
                            return yearA - yearB;
                        }
                        return monthA - monthB;
                    });

                acc[lease.unit] = paymentsArray;
                return acc;
            }, {});

            setPaymentData(groupedPaymentData);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Failed to fetch data: ', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllLeases().then(() => setRefreshing(false));
    };

    const openUpdateModal = (unit) => {
        const selectedUnitData = paymentData[unit] ? paymentData[unit].flat() : [];
        setModalData(selectedUnitData);

        const newPaidStatuses = selectedUnitData.reduce((acc, payment) => {
            acc[payment.month] = payment.isPaid;
            return acc;
        }, {});

        const newRentAmounts = selectedUnitData.reduce((acc, payment) => {
            acc[payment.month] = payment.rentAmount;
            return acc;
        }, {});

        setPaidStatuses(newPaidStatuses);
        setUpdatedRentAmounts(newRentAmounts);
        setModalVisible(true);
    };

    const togglePaid = (id) => {
        setPaidStatuses(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const submit = async (updateID) => {
        setIsLoading(true);

        try {
            modalData.forEach(async (payment) => {
                const isPaidUpdateData = paidStatuses[payment.month];
                const updatedRentAmount = updatedRentAmounts[payment.month];

                await updateRentPaid(payment.leaseId, payment.month, isPaidUpdateData);
                await updateRentAmount(payment.leaseId, payment.month, parseFloat(updatedRentAmount));
            });

            Toast.show({
                type: "success",
                text1: "Lease update successful!"
            });
            setModalVisible(false);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            Toast.show({
                type: "error",
                text1: "Error occurred..."
            });
        } finally {
            setIsLoading(false);
        }

        if (isLoading) return <Redirect href="/lease" />;
    };

    if (isLoading) {
        return (
            <LoadingScreen />
        )
    };

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            {
                modalVisible &&
                <Modal
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setModalVisible(!modalVisible);
                    }}
                >
                    <ScrollView>
                        <View
                            className="flex-col bg-white justify-between m-1"
                            style={{ marginTop: 50, marginHorizontal: 20, backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}
                        >
                            <View className="w-full self-end p-4">
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    className="w-[40px] rounded-xl flex flex-row justify-center items-center bg-transparent p-1 ml-1 mt-2 mb-4"
                                >
                                    <Image
                                        source={icons.close}
                                        style={{ backgroundColor: 'transparent', width: 40, height: 40 }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ marginBottom: 15, textAlign: "center" }} className="text-[#FFA500] font-pbold text-2xl mt-6">Payment List</Text>
                            {modalData.map((payment, index) => (
                                <View key={index} className="flex-col mb-3 p-2">
                                    <Text className="text-[20px] text-black font-psemibold mb-2">{payment.month}</Text>
                                    <Text className="text-[16px] text-black font-psemibold">Rent Amount:</Text>
                                    <TextInput
                                        style={{
                                            height: 40,
                                            borderColor: "gray",
                                            borderWidth: 1,
                                            marginBottom: 10,
                                            paddingHorizontal: 10,
                                            borderRadius: 5,
                                        }}
                                        placeholder={`Rent Due: $${payment.rentAmount}`}
                                        keyboardType="numeric"
                                        value={updatedRentAmounts[payment.month]?.toString() || payment.rentAmount.toString()}
                                        onChangeText={(text) =>
                                            setUpdatedRentAmounts((prev) => ({
                                                ...prev,
                                                [payment.month]: text,
                                            }))
                                        }
                                    />
                                    <View>
                                        <Text className="text-[16px] text-black font-psemibold">Paid?</Text>
                                        <Switch
                                            trackColor={{ false: "#767577", true: "#767577" }}
                                            thumbColor={paidStatuses[payment.month] ? "#FF9C01" : "#f4f3f4"}
                                            onValueChange={() => togglePaid(payment.month)}
                                            value={paidStatuses[payment.month]}
                                        />
                                    </View>
                                </View>
                            ))}
                            <CustomButton
                                title="Submit"
                                handlePress={() => submit()}
                                containerStyles="mt-7 p-4 mb-6"
                            />
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
                payment lists
            </Text>
            <ScrollView
                className="flex-1 p-4 h-full"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#fff"]}
                        tintColor="#fff"
                    />
                }
            >
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                    <View className="flex-column">
                        {Object.entries(paymentData).map(([unit, paymentsArray]) => (
                            <View key={unit}>
                                <Text className="text-xl font-psemibold text-white">{`Unit ${unit}`}</Text>
                                <CustomButton
                                    title="Update"
                                    handlePress={() => openUpdateModal(unit)}
                                    containerStyles="mt-2 mb-6 p-2"
                                />
                                {/* {paymentsArray.map((paymentDetails, index) => (
                                    <View key={index} className="flex-row justify-between bg-gray-800 m-1 p-2">
                                        <Text className="text-white">{paymentDetails.month}</Text>
                                        <Text className="text-white">{`Rent Due: $${paymentDetails.rentAmount}`}</Text>
                                        <Text className="text-white">{paymentDetails.isPaid.isPaid ? "Paid" : "Not Paid"}</Text>
                                    </View>
                                ))} */}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    )
};

export default UpdatePaymentList;