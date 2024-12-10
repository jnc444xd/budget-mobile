import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { icons } from "../constants";

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <>
      {
        isLoading ?
          <View className="w-full flex-row justify-center mt-4">
            <Image
              source={icons.loading}
              className="w-[50] h-[50]"
              resizeMode="contain"
            />
          </View>
          :
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            activeOpacity={1}
            className={`rounded-xl min-h-[55px] flex flex-row justify-center items-center ${containerStyles} ${isLoading ? "opacity-50" : ""
              }`}
            style={{
              backgroundColor: isPressed ? "#3DAA52" : "#FFA500"
            }}
            disabled={isLoading}
          >
            <Text className={`text-white font-psemibold text-lg ${textStyles}`}>
              {title}
            </Text>
          </TouchableOpacity>
      }
    </>
  );
};

export default CustomButton;