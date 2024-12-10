import { useState, useEffect } from 'react';
import { TouchableOpacity, Text, SafeAreaView, View, Image, ScrollView } from 'react-native';
import { router } from "expo-router"
import { getAllUsers } from "../../firebase/database";
import { icons } from "../../constants/";
import LoadingScreen from "../../components/LoadingScreen";
import Header from "../../components/Header";

const AdminChatSelect = () => {
    const [users, setUsers] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const fetchedUsers = await getAllUsers();

            const groupedData = fetchedUsers.reduce((acc, item) => {
                (acc[item.unit] = acc[item.unit] || []).push(item);
                return acc;
            }, {});

            const filteredData = extractUserDetails(groupedData);

            setUsers(filteredData);
        } catch (error) {
            console.error('Failed to fetch data: ', error);
        }
    };

    const extractUserDetails = (data) => {
        const result = {};
        Object.entries(data).forEach(([unit, users]) => {
            result[unit] = users.map(user => ({
                firstName: user.firstName,
                lastName: user.lastName,
                accountID: user.accountID,
                id: user.id
            }));
        });
        return result;
    };

    if (!users) {
        return (
            <LoadingScreen />
        )
    };

    return (
        <SafeAreaView className="bg-primary h-full flex-1">
            <View className="flex-row justify-start w-full mt-2 mb-10">
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
            <Text className="text-2xl font-semibold text-[#C3B299] font-psemibold ml-4 mb-2">
                chatrooms
            </Text>
            <ScrollView className="flex-1">
                <View className="space-y-8 mt-4 ml-4">
                    {
                        users && Object.entries(users).map(([unit, userArray]) => (
                            <View key={unit}>
                                <Text className="text-white text-xl font-psemibold mb-3">Unit {unit}</Text>
                                {userArray.map((user, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            router.push({ pathname: "/adminChatRoom", params: { chatroomID: user.accountID, recipientID: user.id } });
                                        }}
                                        style={{ backgroundColor: 'transparent', marginBottom: 5, elevation: 1 }}
                                    >
                                        <Text className="text-xl text-[#FFA500] font-psemibold">{user.firstName} {user.lastName}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminChatSelect;