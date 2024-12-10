import { MaterialCommunityIcons } from "@expo/vector-icons"
import Constants from "expo-constants";
import { MotiPressable } from "moti/interactions";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { router } from "expo-router";
import { icons } from "../constants";

const _colors = {
    gray: "#1D1520",
    white: "#f3f3f3",
};
const menu = [
    { icon: "home", color: "#A8E6CF", destination: "home" },
    { icon: "chat", color: "#FFD3B6", destination: "chat" },
    { icon: "hammer-wrench", color: "#FEF59A", destination: "overview" },
    { icon: "account", color: "#D7BCE8", destination: "account" },
];

export function FabButton({
    menu,
    size = 64,
    closedOffset = 4,
    onPress,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const iconSize = useMemo(() => size * 0.5, [size]);
    return (
        <View>
            <View style={{ position: "absolute" }}>
                {menu.map((menuItem, index) => {
                    const totalAngle = Math.PI; // 180 degrees in radians
                    const items = menu.length; // Number of items
                    const angleIncrement = totalAngle / (items - 1); // Angular spacing
                    const _radius = size * 1.3;

                    // Calculate the angle for the current item
                    const currentAngle = angleIncrement * index;

                    return (
                        <MotiPressable
                            key={menuItem.icon}
                            onPress={() => {
                                setIsOpen((isOpen) => !isOpen);
                                onPress(menuItem);
                            }}
                            animate={{
                                translateX: -1 * Math.cos(currentAngle) * (isOpen ? _radius : closedOffset),
                                translateY: -1 * Math.sin(currentAngle) * (isOpen ? _radius : closedOffset),
                            }}
                            style={[
                                styles.circle,
                                { backgroundColor: menuItem.color, position: "absolute" },
                                { width: size, height: size, borderRadius: size / 2 },
                            ]}
                            transition={{
                                delay: index * 100,
                            }}>
                            <MaterialCommunityIcons name={menuItem.icon} size={iconSize} color={"#000"} />
                        </MotiPressable>
                    );
                })}
            </View>
            <MotiPressable
                onPress={() => {
                    setIsOpen((isOpen) => !isOpen);
                }}
                style={[
                    styles.circle,
                    { backgroundColor: _colors.gray },
                    { width: size, height: size, borderRadius: size / 2 },
                ]}
                animate={{
                    rotate: isOpen ? "0deg" : "45deg",
                }}>
                {
                    isOpen ?
                        <MaterialCommunityIcons name="close" size={iconSize} color={"#fff"} />
                        :
                        <MaterialCommunityIcons name="close" size={iconSize} color={"#fff"} />
                }
            </MotiPressable>
        </View>
    );
};

const NavButton = () => {
    return (
        <View style={styles.container}>
            <View style={styles.fabContainer}>
                <FabButton
                    menu={menu}
                    onPress={(menuItem) => {
                        // console.log(menuItem.icon);
                        // alert("Pressed: " + menuItem.icon);
                        router.push(`/${menuItem.destination}`)
                    }}
                    size={64}
                    closedOffset={4}
                />
                <Text style={styles.text}>
                    [Default]{"\n"}size: 64{"\n"}closedOffset:4
                </Text>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-evenly",
        backgroundColor: "transparent",
        padding: 8,
    },
    fabContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 40,
        marginBottom: 20,
    },
    circle: {
        justifyContent: "center",
        alignItems: "center",
    },
});

export default NavButton;