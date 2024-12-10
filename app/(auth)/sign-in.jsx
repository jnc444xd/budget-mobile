import { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity
} from "react-native";
import Toast from 'react-native-toast-message'
import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import { signIn } from "../../firebase/auth"

const SignIn = () => {
  const { loading, isLogged, setIsLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/home" />;

  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Toast.show({
        type: "error",
        text1: "Please fill in all fields."
      });
      return;
    }

    setSubmitting(true);

    try {
      await signIn(form.email, form.password);
      setIsLogged(true);

      console.log("Success", "User signed in successfully");
      Toast.show({
        type: "success",
        text1: "Successfully signed in!"
      });
      router.replace("/home");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Please check email and password and try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const closeTooltip = () => {
    if (tooltipVisible) {
      setTooltipVisible(false);
    }
  };

  return (
    <SafeAreaView className="bg-[#09141d] flex-1">
      {
        !loading && isLogged ? (
          <Redirect href="/home" />
        ) : (
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback onPress={closeTooltip}>
              <ScrollView
                contentContainerStyle={styles.scrollViewContent}
              >
                <View className="flex items-center justify-center">
                  <View className="flex-row justify-start w-full">
                    <Image
                      source={images.logoNoText}
                      resizeMode="contain"
                      className="w-[100px] h-[100px] mb-[40]"
                    />
                  </View>
                  <View className="w-[100%]">
                    <Text className="text-[60px] font-gregular text-[#EDEBD7]">
                      Welcome to
                    </Text>
                    <Text className="text-[30px] font-pregular text-[#EDEBD7] mb-4 ml-5">CLYDE AVE</Text>
                  </View>
                  <FormField
                    title="Email"
                    value={form.email}
                    handleChangeText={(e) => setForm({ ...form, email: e })}
                    otherStyles="mt-4"
                    keyboardType="email-address"
                  />
                  <FormField
                    title="Password"
                    value={form.password}
                    handleChangeText={(e) => setForm({ ...form, password: e })}
                    otherStyles="mt-4"
                  />
                  <TouchableOpacity
                    onPress={submit}
                    onPressIn={() => setIsPressed(true)}
                    onPressOut={() => setIsPressed(false)}
                    activeOpacity={0.8}
                    className={`rounded-xl min-h-[55px] flex flex-row justify-center items-center w-[150] mt-9`}
                    style={{
                      backgroundColor: isPressed ? "#3DAA52" : "#FFA500"
                    }}
                  >
                    <Text className={`text-white font-psemibold text-xl`}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <View className="flex-row justify-center mt-5 relative">
                    <TouchableOpacity
                      onPress={() => setTooltipVisible(!tooltipVisible)}
                    >
                      <Text className="text-md font-pregular text-gray-400">
                        Need Assistance?
                      </Text>
                    </TouchableOpacity>
                    {tooltipVisible && (
                      <View
                        style={{
                          position: "absolute",
                          top: -10,
                          backgroundColor: "#FFF",
                          padding: 10,
                          borderRadius: 8,
                          zIndex: 10,
                        }}
                        className="w-[80%]"
                      >
                        <Text className="text-[#000] text-l p-2 leading-relaxed">
                          If you are having trouble accessing your account, please contact management at:{"\n"}{"\n"}
                          LeasingAtClyde@gmail.com{"\n"}
                          (424) 279-4502
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        )
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'none'
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});

export default SignIn;