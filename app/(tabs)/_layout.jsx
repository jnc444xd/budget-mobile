import { useState, useEffect } from "react";
import { Redirect, Tabs, useRouter, useSegments } from "expo-router";
import { Image, Text, View, Animated, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { useNotification } from "../../context/NotificationProvider";
import MaintenanceLayout from "./(maintenance)/_layout";
import HomeLayout from "./(home)/_layout";

const tabBarMargin = 15;
const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;
const tabBarHeight = screenHeight * 0.08;
const tabBarWidth = screenWidth - (2 * tabBarMargin);
const tabWidth = tabBarWidth / 4;

const MyTabBar = ({ state, descriptors, navigation }) => {
  const router = useRouter();
  const segments = useSegments();
  const [activeIndex, setActiveIndex] = useState(state.index);

  const [translateX] = useState(new Animated.Value(0));

  const translateTab = (index) => {
    Animated.spring(translateX, {
      toValue: index * tabWidth,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    translateTab(state.index)
  }, [state.index]);

  const handlePress = (route, index) => {
    setActiveIndex(index);
    router.push(route);
  };

  // const hideTabBarRoutes = ["chat"];
  // const isTabBarHidden = hideTabBarRoutes.includes(state.routes[state.index]?.name);

  // if (isTabBarHidden) {
  //   return null;
  // }

  return (
    <View
      style={styles.tabBarContainer}
    >
      <Animated.View style={styles.slidingTabContainer}>
        <Animated.View style={[styles.slidingTabOverlay, { transform: [{ translateX }] }]} />
        <Animated.View style={[styles.slidingTab, { transform: [{ translateX }] }]} />
      </Animated.View>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const descriptor = descriptors[route.key];
        const options = descriptor?.options;
        const title = descriptor?.options.title;
        const tabBarIcon = options?.tabBarIcon;

        // console.log(`Route: ${route.name}`);
        // console.log("tab bar icon:", tabBarIcon);

        return (
          <TouchableOpacity
            key={route.name}
            onPress={() => handlePress(route.name, index)}
            style={styles.tabButton}
          >
            <View style={styles.iconContainer}>
              {tabBarIcon &&
                tabBarIcon({
                  focused: isFocused,
                  index: state.index,
                })}
            </View>
            {
              isFocused ?
                <Text className={`text-xs ${isFocused ? 'font-psemibold' : 'font-pregular'} mt-1`} style={isFocused ? styles.focusedTabText : styles.regularTabText}>
                  {title.charAt(0).toUpperCase() + title.slice(1)}
                </Text>
                :
                null
            }
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabIcon = ({ index, icon, iconFocused, color, focused, badgeCount, width = 24, height = 24, marginTop = 0, marginBottom = 0, marginLeft = 0 }) => {
  const [translateY] = useState(new Animated.Value(0));

  const translateIcon = (val) => {
    Animated.spring(translateY, {
      toValue: val,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (focused) {
      translateIcon(-16);
    } else {
      translateIcon(0);
    }
  }, [index, focused]);

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <Image
        source={focused ? iconFocused : icon}
        resizeMode="contain"
        tintColor={color}
        style={{ width, height, marginTop, marginBottom, marginLeft }}
      />
      {badgeCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -8,
            backgroundColor: "#BC4F36",
            borderRadius: 8,
            width: 16,
            height: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 10,
              fontWeight: "bold",
            }}
          >
            {badgeCount}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const TabLayout = () => {
  const { user, loading, isLogged } = useGlobalContext();
  const { newMessageLength } = useNotification();
  // console.log("new msg length: ", newMessageLength);

  // const [unreadMessages, setUnreadMessages] = useState(0);

  if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  // useEffect(() => {
  //   if (!user || !user.accountID) return;

  //   const unsubscribeFunctions = [];

  //   const fetchUnreadMessages = async () => {
  //     try {
  //       const accountDocRef = firestore().collection('chats').doc(user.accountID);

  //       const messagesSubcollectionQuery = accountDocRef
  //         .collection('messages')
  //         .where('recipientID', '==', user.uid)
  //         .where('isRead', '==', false);

  //       const unsubscribe = messagesSubcollectionQuery.onSnapshot((snapshot) => {
  //         setUnreadMessages(snapshot.size);
  //       });

  //       unsubscribeFunctions.push(unsubscribe);
  //     } catch (error) {
  //       console.error('Error setting up real-time updates for unread messages:', error);
  //     }
  //   };

  //   fetchUnreadMessages();

  //   return () => {
  //     unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
  //   };
  // }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          borderTopColor: "transparent",
          height: tabBarHeight,
          shadowOpacity: 0,
          shadowColor: "transparent",
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        },
      }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tabs.Screen
        name="(home)"
        element={<HomeLayout />}
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={icons.home}
              iconFocused={icons.homeFocused}
              // color={color}
              focused={focused}
              width={26}
              height={26}
            />
          ),
        }}
        initialParams={user}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={icons.chat}
              iconFocused={icons.chatFocused}
              // color={color}
              focused={focused}
              badgeCount={newMessageLength}
              width={30}
              height={30}
              marginTop={2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(maintenance)"
        element={<MaintenanceLayout />}
        options={{
          title: "Maintenance",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={icons.maintenance}
              iconFocused={icons.maintenanceFocused}
              // color={color}
              focused={focused}
              width={30}
              height={30}
            />
          ),
        }}
        initialParams={user}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={icons.account}
              iconFocused={icons.accountFocused}
              // color={color}
              focused={focused}
              width={27}
              height={27}
              marginLeft={5}
            />
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#09141d",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    height: tabBarHeight,
    width: tabBarWidth,
    position: "absolute",
    alignSelf: "center",
    bottom: 20,
    borderRadius: 20,
  },
  iconContainer: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  slidingTabContainer: {
    width: tabWidth,
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
  },
  slidingTabOverlay: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "transparent",
    bottom: 20,
    borderWidth: 11,
    borderColor: "#09141d",
    zIndex: 10,
  },
  slidingTab: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F9A602",
    bottom: 20,
    borderWidth: 4,
    borderColor: "#09141d",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
  },
  focusedTabText: {
    color: "#F9A602"
  },
  regularTabText: {
    color: "white"
  },
});

export default TabLayout;