import { View, Text } from "react-native";

const RentCard = ({ month, rentAmount, isPaid }) => {
    const formattedRent = rentAmount
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(rentAmount)
        : null;

    return (
        <View
            className="w-[90%] rounded-3xl p-6"
            style={{
                backgroundColor: "rgba(31, 47, 61, 0.9)",
                // shadowColor: "white",
                // shadowOffset: { width: 0, height: 5 },
                // shadowOpacity: 0.5,
                // shadowRadius: 15,
                // elevation: 10,
            }}
        >
            <Text className="flex-1 p-2 text-xl text-[#C3B299] font-psemibold">
                {month ? month : null}
            </Text>
            <Text className="flex-1 p-2 text-base text-white font-psemibold">
                Rent Due:  <Text className="flex-1 p-2 text-base text-gray-400 font-psemibold">{formattedRent ? formattedRent : null}</Text>
            </Text>
            <Text className="flex-1 p-2 text-base text-white font-psemibold">
                Status:  <Text className={`flex-1 p-2 text-base ${isPaid ? "text-[#8BC34A]" : "text-gray-400"} font-psemibold`}>{isPaid ? "Paid" : "Not Paid"}</Text>
            </Text>
        </View>
    )
};

export default RentCard;