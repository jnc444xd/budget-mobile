import { ImageBackground, StyleSheet, View } from "react-native";
import { images } from "../constants";

const Background = ({ children }) => {
    return (
        <ImageBackground
            source={images.altBackground}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                {children}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1, // Ensures it stays behind all other content
    },
    container: {
        flex: 1,
    },
});

export default Background;