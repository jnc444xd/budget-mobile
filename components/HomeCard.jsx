import { View, Text, TouchableOpacity } from "react-native";

const HomeCard = ({ id, title, message, formattedDate, user, deleteConfirmation, renderDots }) => {
    return (
        <View
            key={id}
            className="w-[95%] rounded-3xl p-6"
            style={{
                minHeight: 100,
                backgroundColor: "rgba(31, 47, 61, 0.9)",
                // shadowColor: "black",
                // shadowOffset: { width: 0, height: 5 },
                // shadowOpacity: 0.5,
                // shadowRadius: 10,
                // elevation: 10,
            }}
        >
            <View className="flex">
                <Text className="flex-1 p-2 text-xl text-[#C3B299] font-pbold">{title}</Text>
                <Text className="flex-1 p-2 text-[#FFF] text-base font-pregular">{message}</Text>
                <Text className="flex-1 p-2 text-gray-400 text-xs font-pregular">
                    {formattedDate}
                </Text>
            </View>
            {
                user?.isAdmin &&
                deleteConfirmation &&
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

export default HomeCard;