import { View, Text, TouchableOpacity } from "react-native";

const CompletedCard = ({ id, createdAt, subject, isComplete, arrivalWindow, arrivalNotes, openModal }) => {
    return (
        <TouchableOpacity onPress={() => openModal(arrivalWindow, arrivalNotes, id)}>
            <View
                key={id}
                className="flex flex-row items-center w-[90%] rounded-2xl shadow-lg p-3 my-2"
                style={{
                    backgroundColor: "rgba(31, 47, 61, 0.9)",
                    // shadowColor: "black",
                    // shadowOffset: { width: 0, height: 5 },
                    // shadowOpacity: 0.5,
                    // shadowRadius: 8,
                    // elevation: 10,
                }}
            >
                <View className="flex flex-wrap w-[70%] p-2 space-y-2">
                    <Text className="flex-1 text-start text-xs text-gray-400 font-psemibold">
                        {createdAt}
                    </Text>
                    <Text className="flex-1 text-start text-white font-psemibold">
                        {subject ? subject : "Subject not provided"}
                    </Text>
                </View>
                <View className="w-[30%] text-center p-2">
                    {isComplete ?
                        <Text className="text-[#8BC34A] text-center font-psemibold">See Details</Text>
                        :
                        <Text className="text-[#8BC34A] text-center font-psemibold">In Progress</Text>
                    }
                </View>
            </View>
        </TouchableOpacity>
    )
};

export default CompletedCard;