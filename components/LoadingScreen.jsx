import { View, Image } from 'react-native';
import { images } from '../constants';

const LoadingScreen = () => {
    return (
        <View className="flex-1 items-center justify-center bg-[#09141d]">
            <Image
                source={images.loading}
                style={{
                    width: 200,
                    height: 200,
                }}
                resizeMode="contain"
            />
        </View>
    );
};

export default LoadingScreen;