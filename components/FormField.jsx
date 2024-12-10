import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image
} from "react-native";

import { icons } from "../constants";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-white font-pmedium">{title}</Text>

      <View className="w-full h-min-16 px-4 bg-white rounded-2xl border-2 border-[#203A48] focus:border-[#FFA500] flex flex-row items-center">
        {
          title === "Description" ?
            <TextInput
              style={{
                height: Math.min(120, Math.max(60, inputHeight)),
                textAlignVertical: "center",
              }}
              className="flex-1 text-black font-psemibold text-base py-4"
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#7B7B8B"
              onChangeText={handleChangeText}
              secureTextEntry={title === "Password" && !showPassword}
              multiline={true}
              onContentSizeChange={(event) => {
                setInputHeight(event.nativeEvent.contentSize.height);
              }}
              {...props}
            />
            :
            <TextInput
              className="flex-1 text-black font-psemibold text-base h-14"
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#7B7B8B"
              onChangeText={handleChangeText}
              secureTextEntry={title === "Password" && !showPassword}
              {...props}
            />
        }
        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
