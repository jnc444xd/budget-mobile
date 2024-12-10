import React, { useEffect, useState } from 'react';
import { SafeAreaView, Dimensions, View, Text } from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import Constants from "expo-constants";
import ChatRoom from "../../components/ChatRoom";
import LoadingScreen from "../../components/LoadingScreen";
import Header from "../../components/Header";

const screenHeight = Dimensions.get("window").height;
const tabBarHeight = screenHeight * 0.08;

const Chat = () => {
  const [chatroomID, setChatroomID] = useState(null);

  const { user, isLogged } = useGlobalContext();

  const adminUID = Constants.expoConfig.extra.adminUID;

  useEffect(() => {
    if (user?.accountID) {
      setChatroomID(user.accountID);
    }
  }, [user]);

  if (!chatroomID) {
    return (
      <LoadingScreen />
    )
  };

  return (
    <SafeAreaView className="bg-[#09141d] flex-1">
      <View className="flex w-[100%] justify-start bg-transparent">
        <Text className="text-white text-lg text-center font-plight p-2">CLYDE</Text>
      </View>
      <ChatRoom
        chatroomID={chatroomID}
        recipientID={adminUID}
        tabBarHeight={tabBarHeight}
      />
    </SafeAreaView>
  );
};

export default Chat;