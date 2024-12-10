import { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import { View, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import { useGlobalContext } from "../context/GlobalProvider";

const Welcome = () => {
  const { loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <SafeAreaView edges={["top"]} className="bg-[#09141d] flex-1">
      <View className="flex-grow justify-center items-center w-full h-full">
        <Image
          source={images.logo}
          className="w-[200] h-[200]"
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={() => router.push("/sign-in")}
        >
          <Image
            source={images.enter}
            className="w-[300] h-[150]"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;