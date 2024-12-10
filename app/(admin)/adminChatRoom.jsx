import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native";
import ChatRoom from "../../components/ChatRoom";

const AdminChatRoom = () => {
    const params = useLocalSearchParams();
    const { chatroomID, recipientID } = params;

    return (
        <SafeAreaView className="bg-[#09141d] flex-1">
            <ChatRoom
                chatroomID={chatroomID}
                recipientID={recipientID}
                tabBarHeight={0}
            />
        </SafeAreaView>
    )
};

export default AdminChatRoom;