import 'dotenv/config';

export default () => {
  return {
    expo: {
      owner: "jnc444xd",
      name: "Clyde",
      slug: "clyde-ave",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#09141d"
      },
      updates: {
        fallbackToCacheTimeout: 0
      },
      assetBundlePatterns: ["**/*"],
      ios: {
        bundleIdentifier: "com.unionky.clyde",
        supportsTablet: true,
        googleServicesFile: "./GoogleService-Info.plist",
        infoPlist: {
          UIBackgroundModes: ["remote-notification"],
        }
      },
      android: {
        package: "com.unionky.clyde",
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#ffffff"
        }
      },
      web: {
        favicon: "./assets/favicon.png"
      },
      extra: {
        eas: {
          projectId: process.env.EXPO_PROJECT_ID
        },
        firebaseConfig: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID
        },
        adminUID: process.env.REACT_APP_ADMIN_UID
      },
      plugins: [
        "@react-native-firebase/app",
        [
          "expo-build-properties",
          {
            ios: {
              useFrameworks: "static"
            }
          }
        ],
        "expo-router",
        "expo-font"
      ],
      scheme: "clyde-ave"
    }
  };
};