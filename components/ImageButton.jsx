import { Text, TouchableOpacity, View, Image } from "react-native";
import { icons } from "../constants";

const ImageButton = ({
    title,
    icon,
    handlePress,
    buttonPressed,
}) => {
    return (
        <>
            {
                buttonPressed ?
                    <View className="flex-row justify-center">
                        <Image
                            source={icons.loading}
                            className="w-[30] h-[30]"
                            resizeMode="contain"
                        />
                    </View>
                    :
                    <View className="flex flex-col items-center mx-2">
                        <TouchableOpacity
                            onPress={handlePress}
                            className="flex justify-center items-center w-[65] h-[65] rounded-2xl"
                            style={{ backgroundColor: "rgba(65, 65, 65, .8)" }}
                            activeOpacity={0.7}
                            disabled={buttonPressed}
                        >
                            <Image
                                source={icon}
                                resizeMode="contain"
                                className="w-[40px] h-[40px]"
                            />
                        </TouchableOpacity>
                        <Text className="text-sm text-[#FFA500] font-psemibold mt-1">{title}</Text>
                    </View>
            }
        </>
    );
};

export default ImageButton;