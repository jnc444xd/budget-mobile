import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  ScrollView,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  StyleSheet,
  FlatList,
  Easing
} from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Redirect, router, usePathname } from "expo-router";
import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getLease, getUnreadNotifications, markNotificationAsRead, } from "../../firebase/database";
import LogoutButton from "../../components/LogoutButton";
import LoadingScreen from "../../components/LoadingScreen";
import Header from "../../components/Header";
import Background from "../../components/Background";
import AccountCard from "../../components/AccountCard";
import RentCard from "../../components/RentCard";
import HomeCard from "../../components/HomeCard";
import CustomButton from "../../components/CustomButton";
import Alerts from "../../components/Alerts";

const { width } = Dimensions.get("screen");
const ITEM_WIDTH = width * 0.72;
const SPACING = 20;

const AccountInfo = () => {
  const [lease, setLease] = useState(null);
  const [paymentList, setPaymentList] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentList, setShowPaymentList] = useState(false);
  // const [notifications, setNotifications] = useState([]);
  // const [notifLength, setNotifLength] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { user, isLogged, loading } = useGlobalContext();

  const pathname = usePathname();

  const scrollX = useRef(new Animated.Value(0)).current;

  // if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  const monthOrder = {
    "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
    "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
  };

  const fetchData = async () => {
    if (!user) return;

    try {
      const fetchedData = await getLease(user.unit);
      setLease(fetchedData[0]);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to fetch lease: ', error);
    }
  };

  // const fetchUnreadNotifications = async (accountID) => {
  //   if (!accountID) {
  //     console.error("Account ID is required");
  //     return;
  //   }

  //   try {
  //     const notificationData = await getUnreadNotifications(accountID);
  //     setNotifLength(notificationData.length);

  //     setNotifications(notificationData);
  //     console.log("Processed Notifications:", notificationData);

  //     return notificationData;
  //   } catch (error) {
  //     console.error("Failed to fetch unread notifications:", error);
  //   }
  // };

  // const processNotifications = (notifications) => {
  //   let chatCount = 0;
  //   const processedNotifications = notifications.reduce((result, item) => {
  //     if (item?.type === "chat") {
  //       chatCount += 1;
  //       return result;
  //     }
  //     result.push(item);
  //     return result;
  //   }, []);

  //   if (chatCount > 0) {
  //     processedNotifications.unshift({
  //       id: "chat-group",
  //       type: "chat",
  //       title: "Chat Notifications",
  //       body: `You have ${chatCount} new messages`,
  //     });
  //   }

  //   return processedNotifications;
  // };

  // const groupedNotifications = processNotifications(notifications);

  const definePaymentList = () => {
    if (lease) {
      setPaymentList(lease.payments);
    } else {
      return;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
    // fetchUnreadNotifications(user?.accountID);
    // if (user?.accountID) {
    //   fetchUnreadNotifications(user?.accountID);
    // };
  }, [user]);

  useEffect(() => {
    definePaymentList();
    // if (lease) {
    //   setPaymentList(lease.payments);
    // };
  }, [lease]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  };

  // const handleNotificationPress = async (accountID, notificationIDs, location) => {
  //   if (!accountID || !notificationIDs || notificationIDs.length === 0) {
  //     console.error("Invalid input for handling notifications");
  //     return;
  //   }

  //   try {
  //     if (Array.isArray(notificationIDs)) {
  //       const markAllAsReadPromises = notificationIDs.map((id) =>
  //         markNotificationAsRead(accountID, id)
  //       );
  //       await Promise.all(markAllAsReadPromises);
  //     } else {
  //       await markNotificationAsRead(accountID, notificationIDs);
  //     }

  //     if (user?.accountID) {
  //       await fetchUnreadNotifications(user?.accountID);
  //     }

  //     router.push(`/${location}`);
  //   } catch (error) {
  //     console.error("Error handling notifications:", error);
  //   } finally {
  //     toggleModal();
  //   }
  // };

  // const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  // const toggleModal = () => {
  //   if (isModalOpen) {
  //     Animated.timing(slideAnim, {
  //       toValue: screenWidth,
  //       duration: 300,
  //       easing: Easing.ease,
  //       useNativeDriver: true,
  //     }).start(() => setIsModalOpen(false));
  //   } else {
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 300,
  //       easing: Easing.ease,
  //       useNativeDriver: true,
  //     }).start(() => setIsModalOpen(true));
  //   }
  // };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  useEffect(() => {
    setIsModalOpen(false);
  }, [pathname]);

  // const gesture = Gesture.Pan()
  //   .onEnd(() => {
  //     runOnJS(toggleModal)();
  //   });

  // const typeIcon = {
  //   "maintenance": {
  //     icon: icons.update,
  //     bgColor: "#FFD166",
  //   },
  //   "chat": {
  //     icon: icons.message,
  //     bgColor: "#50B3F0",
  //   },
  //   "announcement": {
  //     icon: icons.megaphone,
  //     bgColor: "#EF476F",
  //   },
  //   "community-board": {
  //     icon: icons.pin,
  //     bgColor: "#8338EC",
  //   },
  // };

  if (isLoading) {
    return <LoadingScreen />;
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom", "top"]} className="flex-1 bg-[#09141d]">
      {/* <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View>
            <View style={notifications.length > 0 ? styles.notificationHeader : styles.emptyNotificationHeader}>
              <Text className={`text-[#FFF] ${notifications.length > 0 ? "text-lg" : "text-base"} font-psemibold`}>
                {notifications.length > 0 ? "notifications" : "no new notifications"}
              </Text>
            </View>
            <FlatList
              data={groupedNotifications}
              keyExtractor={(item, index) => (item?.id ? item.id : `null-${index}`)}
              renderItem={({ item, index }) => {
                const isLastItem = index === groupedNotifications.length - 1;
                const typeConfig = typeIcon[item.type] || {};

                return item ? (
                  <TouchableOpacity
                    onPress={() => {
                      if (item.type !== "chat") {
                        handleNotificationPress(user?.accountID, item.id, item.nav);
                      } else if (item.type === "chat") {
                        const chatNotificationIDs = notifications
                          .filter((item) => item?.type === "chat")
                          .map((item) => item.id);
                        handleNotificationPress(user?.accountID, chatNotificationIDs, "chat");
                      }
                    }}
                  >
                    <View
                      style={isLastItem ? styles.lastNotificationContainer : styles.notificationContainer}
                    >
                      <View
                        className="flex justify-center items-center p-1 rounded-md w-[40] h-[40] mr-4"
                        style={{ backgroundColor: typeConfig.bgColor || "#333" }}
                      >
                        <Image
                          source={typeConfig.icon || icons.defaultNotification}
                          resizeMode="contain"
                          className="w-[25px] h-[25px]"
                        />
                      </View>
                      <View>
                        <Text className="text-white text-xs font-psemibold mb-1">{item.title}</Text>
                        <Text className="text-gray-100 text-xs font-pregular">{item.body}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.notificationContainer} />
                );
              }}
            />
          </View>
        </Animated.View>
      </GestureDetector> */}
      <Alerts isModalOpen={isModalOpen} toggleModal={toggleModal} />
      <View className="flex-1 justify-between w-full">
        <Header
          open={toggleModal}
        />
        <View className="w-[90%] self-center mt-6">
          <Text className="text-2xl text-[#FFF] font-psemibold text-left ml-2 mt-2">tenant</Text>
          <Text className="text-2xl text-[#C3B299] font-psemibold text-left ml-2 mb-2">profile</Text>
        </View>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 20
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#fff"]}
              tintColor="#fff"
            />
          }
        >
          <View className="w-[90%] flex items-center mx-auto">
            <AccountCard
              user={user}
              lease={lease}
            />
          </View>
          <View className="w-[full] mx-auto">
            {
              paymentList ? (
                <>
                  <View
                    style={{
                      height: 30,
                      margin: SPACING,
                      width: ITEM_WIDTH,
                      overflow: "hidden",
                      justifyContent: "center",
                    }}>
                    {Object.entries(paymentList).map(([key, item], index) => {
                      const opacity = Animated.divide(scrollX, width).interpolate({
                        inputRange: [index - 0.8, index, index + 1],
                        outputRange: [0, 1, 0],
                      });

                      return (
                        <Animated.Text
                          style={{
                            opacity,
                            position: "absolute",
                            color: "white",
                          }}
                          className="text-2xl font-psemibold ml-2"
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          key={key}>
                          payment list
                        </Animated.Text>
                      );
                    })}
                    <Animated.View
                      style={[
                        StyleSheet.absoluteFillObject,
                        {
                          backgroundColor: "#FFA500",
                          transform: [
                            {
                              translateX: Animated.divide(
                                Animated.modulo(scrollX, width),
                                width
                              ).interpolate({
                                inputRange: [0, 0.2, 0.8, 1],
                                outputRange: [-ITEM_WIDTH, 0, 0, ITEM_WIDTH],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                  <Animated.FlatList
                    data={
                      Object.entries(paymentList)
                        .sort((a, b) => {
                          const yearMonthA = a[0].split(' ');
                          const yearMonthB = b[0].split(' ');
                          const yearA = parseInt(yearMonthA[1], 10);
                          const yearB = parseInt(yearMonthB[1], 10);
                          const monthA = monthOrder[yearMonthA[0]];
                          const monthB = monthOrder[yearMonthB[0]];

                          if (yearA !== yearB) {
                            return yearA - yearB;
                          }
                          return monthA - monthB;
                        })
                    }
                    initialScrollIndex={
                      (() => {
                        const currentMonth = new Date().toLocaleString('default', {
                          month: 'long',
                          year: 'numeric',
                        });
                        return Object.entries(paymentList)
                          .sort((a, b) => {
                            const yearMonthA = a[0].split(' ');
                            const yearMonthB = b[0].split(' ');
                            const yearA = parseInt(yearMonthA[1], 10);
                            const yearB = parseInt(yearMonthB[1], 10);
                            const monthA = monthOrder[yearMonthA[0]];
                            const monthB = monthOrder[yearMonthB[0]];

                            if (yearA !== yearB) {
                              return yearA - yearB;
                            }
                            return monthA - monthB;
                          })
                          .findIndex(([key]) => key === currentMonth);
                      })()
                    }
                    getItemLayout={(data, index) => ({
                      length: width,
                      offset: width * index,
                      index,
                    })}
                    onScrollToIndexFailed={(info) => {
                      console.warn("Scroll to index failed:", info);
                      setTimeout(() => {
                        if (info.highestMeasuredFrameIndex >= 0) {
                          flatListRef.current.scrollToIndex({
                            index: info.index,
                            animated: true,
                          });
                        }
                      }, 500);
                    }}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                      {
                        useNativeDriver: true,
                        listener: (event) => {
                          const index = Math.round(
                            event.nativeEvent.contentOffset.x / width
                          );
                          setActiveIndex(index);
                        },
                      }
                    )}
                    // keyExtractor={(item) => item.id.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                      const [month, details] = item;
                      return (
                        <Animated.View
                          style={{
                            width,
                            alignItems: "center",
                            justifyContent: "start",
                            shadowColor: "#000",
                            shadowOffset: {
                              width: 0,
                              height: 16,
                            },
                            shadowOpacity: 0.4,
                            shadowRadius: 20,
                          }}>
                          <RentCard
                            index={index}
                            month={month}
                            rentAmount={details.rentAmount}
                            isPaid={details.isPaid}
                          />
                        </Animated.View>
                      );
                    }}
                  />
                </>
              ) : (
                <View className="w-[90%] mb-4 mt-8">
                  <HomeCard
                    message="Loading payment list... 😁"
                    user={user}
                  />
                </View>
              )
            }
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 95,
    right: 0,
    width: "70%",
    backgroundColor: "rgba(195, 178, 153, 1)",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    paddingTop: 10,
    paddingLeft: 10,
    paddingBottom: 10,
    zIndex: 100,
  },
  notificationHeader: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 0,
    padding: 15,
    marginBottom: 1,
  },
  emptyNotificationHeader: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 0,
    padding: 15,
    marginBottom: 1,
  },
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 0,
    padding: 10,
    marginBottom: 1,
    minHeight: 55,
  },
  lastNotificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 0,
    padding: 10,
    marginBottom: 1,
    minHeight: 55,
  },
  emptyContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 0,
    padding: 10,
  }
});

export default AccountInfo;