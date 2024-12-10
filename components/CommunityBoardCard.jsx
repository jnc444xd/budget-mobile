import { View, Text, TouchableOpacity } from "react-native";

const CommunityBoardCard = ({ id, title, message, formattedDate, creatorID, user, deleteConfirmation, renderDots, name, unit }) => {
    return (
        <View
            key={id}
            className="w-[95%] rounded-3xl p-6"
            style={{
                backgroundColor: "rgba(195, 178, 153, .9)",
                // shadowColor: "black",
                // shadowOffset: { width: 0, height: 5 },
                // shadowOpacity: 0.5,
                // shadowRadius: 15,
                // elevation: 10,
            }}
        >
            <View className="flex-row">
                <Text className="flex-1 p-2 text-xl text-[#273945] font-pbold">{title}</Text>
            </View>
            <View className="flex-row">
                <Text className="flex-1 p-2 text-[#000] text-base font-pregular">{message}</Text>
            </View>
            <View className="flex-row">
                <Text className="flex-1 p-2 text-[#273945] text-sm font-psemibold">{`Posted by ${name}, Unit ${unit}`}</Text>
            </View>
            <View className="flex-row">
                <Text className="flex-1 p-2 text-gray-600 text-xs font-pregular">
                    {formattedDate}
                </Text>
            </View>
            {
                user && (user.uid === creatorID) && deleteConfirmation &&
                <View className="flex-row justify-center items-center w-full">
                    <TouchableOpacity
                        onPress={() => deleteConfirmation(id)}
                        className="w-full pb-2"
                    >
                        <Text className="text-[16px] text-[#E63946] text-center font-psemibold">Delete</Text>
                    </TouchableOpacity>
                </View>
            }
            {
                user && user.isAdmin &&
                <View className="flex-row justify-center items-center w-full">
                    <TouchableOpacity
                        onPress={() => deleteConfirmation(id)}
                        className="w-full pb-2"
                    >
                        <Text className="text-[16px] text-[#E63946] text-center font-psemibold">Delete</Text>
                    </TouchableOpacity>
                </View>
            }
            {renderDots}
        </View>
    )
};

export default CommunityBoardCard;