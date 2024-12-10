import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity
} from "react-native";
import Toast from 'react-native-toast-message'
import { icons } from "../../constants";
import { signUp } from "../../firebase/auth";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();

  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    unit: "",
    email: "",
    accountID: "",
    password: ""
  });

  const submit = async () => {
    if (form.firstName === "" || form.lastName === "" || form.unit === "" || form.email === "" || form.accountID === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);
    try {
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        unit: form.unit,
        accountID: form.accountID,
        expoPushToken: "",
        isAdmin: false
      };
      const result = await signUp(form.email, form.password, userData);
      Toast.show({
        type: "success",
        text1: "New user sign up successful!"
      });

      if (result) {
        router.replace("/adminControls");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error occurred..."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView className="bg-primary h-full">
        <View className="flex w-[100%] justify-start bg-transparent space-y-6">
          <View className="flex-row justify-start w-full">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-[40px] rounded-xl flex flex-row justify-center items-center bg-transparent p-1 ml-1 mt-2 mb-4"
            >
              <Image
                source={icons.back}
                style={{ backgroundColor: 'transparent', width: 28, height: 28 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl text-[#FFA500] font-psemibold bg-transparent self-start mb-2 ml-4">New Tenant Signup</Text>
        </View>
        <ScrollView>
          <View
            className="w-full flex justify-center items-center h-full px-4 mb-6"
            style={{
              minHeight: Dimensions.get("window").height - 100,
            }}
          >
            <FormField
              title="First Name"
              value={form.firstName}
              handleChangeText={(e) => setForm({ ...form, firstName: e })}
              otherStyles="mt-7"
            />
            <FormField
              title="Last Name"
              value={form.lastName}
              handleChangeText={(e) => setForm({ ...form, lastName: e })}
              otherStyles="mt-7"
            />
            <FormField
              title="Unit Number"
              value={form.unit}
              handleChangeText={(e) => setForm({ ...form, unit: e })}
              otherStyles="mt-7"
              keyboardType="number-pad"
            />
            <FormField
              title="Email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mt-7"
              keyboardType="email-address"
            />
            <FormField
              title="Account ID"
              value={form.accountID}
              handleChangeText={(e) => setForm({ ...form, accountID: e })}
              otherStyles="mt-7"
            />
            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-7"
            />
            <CustomButton
              title="Sign Up"
              handlePress={submit}
              containerStyles="mt-7 w-[100px]"
              isLoading={isSubmitting}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'none'
  }
});

export default SignUp;
