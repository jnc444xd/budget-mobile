import { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, PanResponder, Animated, Dimensions, Image } from "react-native";
import { icons } from "../constants";

const MaintenanceCard = ({ id, createdAt, subject, scheduled, isComplete, arrivalWindow, arrivalNotes, openModal, confirmDelete, setScrollEnabled }) => {
    const [cardHeight, setCardHeight] = useState(0);

    const translateX = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get("window").width;
    const MAX_NEGATIVE_TRANSLATEX = -60;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx < 0) {
                    translateX.setValue(Math.max(gestureState.dx, MAX_NEGATIVE_TRANSLATEX));
                    setScrollEnabled(false);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -10) {
                    confirmDelete(id);

                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start(() => setScrollEnabled(true));
                } else {
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start(() => setScrollEnabled(true));
                }
            },
        })
    ).current;

    return (
        <View style={{ position: "relative", width: "100%", alignItems: "center", marginTop: 10 }}>
            <Animated.View
                style={{
                    position: "absolute",
                    top: 10,
                    bottom: 0,
                    right: -screenWidth * 0.5,
                    width: screenWidth * 0.5,
                    height: cardHeight,
                    backgroundColor: "#BC4F36",
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "start",
                    transform: [{ translateX: translateX }],
                }}
            >
                <TouchableOpacity className="pl-4" onPress={() => confirmDelete(id)}>
                    <Image
                        source={icons.trash}
                        className="w-[20px] h-[20px]"
                    />
                </TouchableOpacity>
            </Animated.View>
            <Animated.View
                style={{
                    flex: 1,
                    transform: [{ translateX: translateX }],
                }}
            >
                <View
                    key={id}
                    className="w-[90%] rounded-2xl p-3 my-2"
                    style={{
                        backgroundColor: "rgba(31, 47, 61, 0.9)",
                        // shadowColor: "white",
                        // shadowOffset: { width: 0, height: 5 },
                        // shadowOpacity: 0.5,
                        // shadowRadius: 8,
                        // elevation: 10,
                    }}
                    onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        setCardHeight(height);
                    }}
                    {...panResponder.panHandlers}
                >
                    <TouchableOpacity
                        onPress={() => openModal(arrivalWindow, arrivalNotes, id)}
                        className="w-full min-h-[74] flex-row"
                    >
                        <View className="flex flex-wrap w-[70%] p-3 space-y-2">
                            <Text className="flex-1 text-start text-xs text-gray-400 font-psemibold">
                                {createdAt}
                            </Text>
                            <Text className="flex-1 text-base text-start text-[#FFF] font-psemibold">
                                {subject}
                            </Text>
                        </View>
                        <View className="w-[30%] flex items-center justify-center p-2">
                            {scheduled ?
                                <>
                                    <Text className="text-[#00E6FF] text-center font-psemibold">Scheduled!</Text>
                                    <Text className="text-[#00E6FF] text-center font-psemibold">See Details</Text>
                                </>
                                :
                                <Text className="text-[#00E6FF] text-center font-psemibold">See Details</Text>
                            }
                        </View>
                    </TouchableOpacity>
                    {/* <View className="flex-1 text-center mr-2">
                        <TouchableOpacity
                            onPress={() => openModal(arrivalWindow, arrivalNotes, id)}
                            className="rounded-xl bg-transparent p-2"
                        >
                            <Text className="flex-1 text-start text-gray-400 font-psemibold">
                                {createdAt}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1 text-center mr-2">
                        <TouchableOpacity
                            onPress={() => openModal(arrivalWindow, arrivalNotes, id)}
                            className="rounded-xl bg-transparent p-2"
                        >
                            <Text className="flex-1 text-start text-[#FFF] font-psemibold">
                                {subject}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1 text-center">
                        {scheduled ?
                            <TouchableOpacity
                                onPress={() => openModal(arrivalWindow, arrivalNotes, id)}
                                className="rounded-xl bg-transparent p-2"
                            >
                                <Text className="text-[#00E6FF] text-center font-psemibold">Scheduled!</Text>
                                <Text className="text-[#00E6FF] text-center font-psemibold">See Details</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity
                                onPress={() => openModal(arrivalWindow, arrivalNotes, id)}
                                className="rounded-xl bg-transparent p-2"
                            >
                                <Text className="text-[#00E6FF] text-center font-psemibold">See Details</Text>
                            </TouchableOpacity>
                        }
                    </View> */}
                </View>
            </Animated.View>
        </View>
    )
};

export default MaintenanceCard;