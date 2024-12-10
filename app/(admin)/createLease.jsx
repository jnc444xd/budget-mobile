import { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, Alert, Image, Button, TouchableOpacity } from "react-native";
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from "expo-router";
import { icons } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { addLease } from "../../firebase/database";
import { useGlobalContext } from "../../context/GlobalProvider";

const CreateLease = () => {
    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        unitNumber: 0,
        rentAmount: 0
    });
    const [payments, setPayments] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);

    const { user } = useGlobalContext();

    const onStartChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShowStart(false);
        setStartDate(currentDate);
    };

    const onEndChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShowEnd(false);
        setEndDate(currentDate);
    };

    const showStartDatePicker = () => {
        setShowStart(true);
    };

    const showEndDatePicker = () => {
        setShowEnd(true);
    };

    const generatePayments = (start, end, rent) => {
        let startDate = new Date(start);
        let endDate = new Date(end);
        const generatedPayments = [];

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        startDate.setDate(1);
        endDate.setDate(1);

        while (startDate <= endDate) {
            generatedPayments.push({
                month: startDate.toLocaleDateString('en-us', { month: 'long', year: 'numeric' }),
                rentAmount: rent,
                isPaid: false
            });
            startDate.setMonth(startDate.getMonth() + 1);
        }

        setPayments(generatedPayments);
    };

    useEffect(() => {
        console.log(payments);
    }, [payments]);

    const submit = async () => {

        const processPayments = (paymentsArray) => {
            const processed = paymentsArray.reduce((acc, payment) => {
                acc[payment.month] = {
                    rentAmount: payment.rentAmount,
                    isPaid: payment.isPaid
                };
                return acc;
            }, {});

            return processed;
        }

        const processedPaymentList = processPayments(payments);

        setSubmitting(true);
        try {
            const leaseData = {
                unit: form.unitNumber,
                startDate: startDate.toDateString(),
                endDate: endDate.toDateString(),
                payments: processedPaymentList
            };
            const result = await addLease(leaseData);
            Toast.show({
                type: "success",
                text1: "Lease created successfully!"
            });
            router.replace("/home");
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error occurred..."
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="bg-primary flex-1">
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
                <Text className="text-2xl text-[#FFA500] font-psemibold bg-transparent self-start mb-2 ml-4">Create Lease</Text>
            </View>
            <View className="flex-1 w-full h-full px-4">
                <ScrollView>
                    <View className="w-full flex justify-center h-full px-4">
                        <FormField
                            title="Unit Number"
                            value={form.unitNumber}
                            handleChangeText={(e) => setForm({ ...form, unitNumber: e })}
                            otherStyles="my-7"
                            keyboardType="number-pad"
                        />

                        <Text className="text-l text-white">Start: {startDate.toLocaleString()}</Text>
                        {!showStart && <Button onPress={showStartDatePicker} title="Select Start Date" />}
                        {showStart && (
                            <DateTimePicker
                                modale
                                testID="startDatePicker"
                                value={startDate}
                                mode="date"
                                onChange={onStartChange}
                            />
                        )}

                        <Text className="text-l text-white">End: {endDate.toLocaleString()}</Text>
                        {!showEnd && <Button onPress={showEndDatePicker} title="Select End Date" />}
                        {showEnd && (
                            <DateTimePicker
                                modal
                                testID="endDatePicker"
                                value={endDate}
                                mode="date"
                                onChange={onEndChange}
                            />
                        )}

                        <FormField
                            title="Rent Amount"
                            value={form.rentAmount}
                            handleChangeText={(e) => setForm({ ...form, rentAmount: e })}
                            otherStyles="mt-7"
                        />

                        {payments.length > 0 &&
                            <>
                                <Text className="text-xl text-white mt-10 text-pregular">Payment List Created!</Text>
                                <CustomButton
                                    title="Regenerate Payments"
                                    handlePress={() => generatePayments(startDate, endDate, form.rentAmount)}
                                    containerStyles="mt-7"
                                    isLoading={isSubmitting}
                                />
                            </>
                        }

                        {payments.length === 0 &&
                            <CustomButton
                                title="Generate Payments"
                                handlePress={() => generatePayments(startDate, endDate, form.rentAmount)}
                                containerStyles="mt-7"
                                isLoading={isSubmitting}
                            />
                        }

                        {payments.length > 0 &&
                            <CustomButton
                                title="Save"
                                handlePress={submit}
                                containerStyles="mt-7"
                                isLoading={isSubmitting}
                            />
                        }

                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default CreateLease;
