import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  StyleSheet,
  FlatList,
  Easing,
} from "react-native";
import Toast from 'react-native-toast-message'
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { CustomButton } from "../../../components";
import { images, icons } from "../../../constants";
import { useGlobalContext } from "../../../context/GlobalProvider";
import {
  getNotices,
  deleteNotice,
  getAllCommunityBoardMessages,
  deleteCommunityBoardMessage,
  getUnreadNotifications,
  markNotificationAsRead,
} from "../../../firebase/database";
import { format } from 'date-fns';
import Header from "../../../components/Header";
import Background from "../../../components/Background";
import HomeCard from "../../../components/HomeCard";
import CommunityBoardCard from "../../../components/CommunityBoardCard";
import LoadingScreen from "../../../components/LoadingScreen";
import Alerts from "../../../components/Alerts";

const { width } = Dimensions.get("screen");
// const screenWidth = Dimensions.get("window").width;

const ITEM_WIDTH = width * 0.72;
const SPACING = 20;

const Home = () => {
  const [communityBoard, setCommunityBoard] = useState(null);
  const [notices, setNotices] = useState([]);
  // const [notifications, setNotifications] = useState([]);
  // const [notifLength, setNotifLength] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNoticeIndex, setActiveNoticeIndex] = useState(0);
  const [activeCommunityBoardIndex, setActiveCommunityBoardIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, isLogged } = useGlobalContext();

  const pathname = usePathname();

  const scrollXNotices = useRef(new Animated.Value(0)).current;
  const scrollXCommunityBoard = useRef(new Animated.Value(0)).current;

  const formatDate = (date) => {
    const [datePart, timePart] = date.split('T');
    const [year, month, day] = datePart.split('-');
    return `${month}/${day}/${year}`;
  };

  const fetchNotices = async () => {
    try {
      const fetchedData = await getNotices();
      const sortedData = fetchedData.map((notice) => ({
        ...notice,
        formattedDate: formatDate(notice.createdAt),
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotices(sortedData);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to fetch notices: ', error);
    }
  };

  const fetchCommunityBoard = async () => {
    try {
      const fetchedData = await getAllCommunityBoardMessages();
      const sortedData = fetchedData.map((notice) => ({
        ...notice,
        formattedDate: formatDate(notice.createdAt),
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setCommunityBoard(sortedData);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to fetch community board messages: ', error);
    }
  };

  // const fetchUnreadNotifications = async () => {
  //   if (!user?.accountID) return;

  //   try {
  //     const notificationData = await getUnreadNotifications(user?.accountID);
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

  useEffect(() => {
    setIsLoading(true);
    fetchNotices();
    fetchCommunityBoard();
    // fetchUnreadNotifications();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchNotices(), fetchCommunityBoard()]).finally(() => {
      setRefreshing(false);
    });
  };

  const handleDeleteNotice = (noticeID) => {
    try {
      deleteNotice(noticeID);
      console.log("Notice deleted successfully");
      Toast.show({
        type: "success",
        text1: "Successfully deleted announcement!"
      });
    } catch (error) {
      console.error("Failed to delete notice: ", error);
      Toast.show({
        type: "error",
        text1: "Failed to delete announcement."
      });
    } finally {
      fetchNotices();
    }
  };

  const deleteNoticeConfirmation = (noticeID) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed")
        },
        {
          text: "OK",
          onPress: () => handleDeleteNotice(noticeID)
        }
      ]
    );
  };

  const handleDeleteMessage = async (messageID) => {
    try {
      await deleteCommunityBoardMessage(messageID);
      console.log("Community board message deleted successfully");
      Toast.show({
        type: "success",
        text1: "Successfully deleted post from community board!"
      });
    } catch (error) {
      console.error("Failed to delete community board message: ", error);
      Toast.show({
        type: "error",
        text1: "Failed to delete community board post."
      });
    } finally {
      fetchCommunityBoard();
    }
  };

  const deleteCommunityBoardConfirmation = (messageID) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed")
        },
        {
          text: "OK",
          onPress: () => handleDeleteMessage(messageID)
        }
      ]
    );
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

  const renderDots = (data, activeIndex) => {
    const containerWidth = data.length * 16;

    return (
      <View style={[styles.dotContainer, { width: containerWidth }]} className="self-center">
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    )
  };

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

  if (isLoading || !user) {
    return (
      <LoadingScreen />
    )
  };

  return (
    <SafeAreaView edges={["left", "right", "top"]} className="flex-1 bg-[#09141d]">
      <Alerts isModalOpen={isModalOpen} toggleModal={toggleModal} />
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
      <View className="bg-transparent">
        <Header
          greeting={`${user ? user?.firstName : null} 👋`}
          open={toggleModal}
        />
      </View>
      {
        user.isAdmin &&
        <View className="flex items-center">
          <CustomButton
            title="Admin Control Panel"
            handlePress={() => router.push("/adminControls")}
            containerStyles="w-[250px] p-2"
          />
        </View>
      }
      <View className="flex-1 w-full bg-transparent mb-10">
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FFF", "#FFF"]} // Android
              tintColor="#FFF" // iOS
              titleColor="#000" // iOS
            />
          }
        >
          <View className="w-full mx-auto">
            {
              notices && notices.length > 0 ? (
                <>
                  <View
                    style={{
                      height: 30,
                      margin: SPACING,
                      width: ITEM_WIDTH,
                      overflow: "hidden",
                      justifyContent: "center",
                    }}>
                    {notices.map((item, index) => {
                      const opacity = Animated.divide(scrollXNotices, width).interpolate({
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
                          className="text-2xl font-psemibold"
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          key={item.id}>
                          announcements
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
                                Animated.modulo(scrollXNotices, width),
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
                    data={notices}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: scrollXNotices } } }],
                      {
                        useNativeDriver: true,
                        listener: (event) => {
                          const index = Math.round(
                            event.nativeEvent.contentOffset.x / width
                          );
                          setActiveNoticeIndex(index);
                        },
                      }
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => {
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
                          <HomeCard
                            index={index}
                            id={item.id}
                            title={item.title}
                            message={item.message}
                            formattedDate={item.formattedDate}
                            deleteConfirmation={deleteNoticeConfirmation}
                            user={user}
                            renderDots={renderDots(notices, activeNoticeIndex)}
                          />
                        </Animated.View>
                      );
                    }}
                  />
                </>
              ) : (
                <View className="w-[90%] mb-4">
                  <HomeCard
                    title="None"
                    message="No announcements at this time. Please check again later! 😁"
                    user={user}
                  />
                </View>
              )
            }
          </View>
          <View className="w-full mx-auto mb-[80]">
            {
              communityBoard && communityBoard.length > 0 ? (
                <>
                  <View className="w-[90%] flex flex-row justify-between items-center">
                    <View
                      style={{
                        height: 30,
                        margin: SPACING,
                        width: ITEM_WIDTH,
                        overflow: "hidden",
                        justifyContent: "center",
                        position: "relative",
                      }}>
                      {communityBoard.map((item, index) => {
                        const opacity = Animated.divide(scrollXCommunityBoard, width).interpolate({
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
                            className="text-2xl font-psemibold"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            key={item.id}>
                            community board
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
                                  Animated.modulo(scrollXCommunityBoard, width),
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
                    <View className="flex justify-start items-start">
                      <TouchableOpacity
                        onPress={() => router.push("/createMessage")}
                        className="rounded-xl bg-transparent"
                      >
                        <Image
                          source={icons.add}
                          resizeMode="contain"
                          className="w-[27px] h-[27]"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Animated.FlatList
                    data={communityBoard}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: scrollXCommunityBoard } } }],
                      {
                        useNativeDriver: true,
                        listener: (event) => {
                          const index = Math.round(
                            event.nativeEvent.contentOffset.x / width
                          );
                          setActiveCommunityBoardIndex(index);
                        },
                      }
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => {
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
                          <CommunityBoardCard
                            key={index}
                            id={item.id}
                            title={item.subject}
                            message={item.description}
                            formattedDate={item.formattedDate}
                            creatorID={item.creatorID}
                            name={item.name}
                            unit={item.unit}
                            user={user}
                            deleteConfirmation={deleteCommunityBoardConfirmation}
                            renderDots={renderDots(communityBoard, activeCommunityBoardIndex)}
                          />
                        </Animated.View>
                      );
                    }}
                  />
                </>
              ) : (
                <View className="w-[90%] mb-4">
                  <HomeCard
                    title="None"
                    message="Nothing posted at this time. Please check again later! 😁"
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
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#FFF",
  },
  inactiveDot: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    position: "absolute",
    top: 95,
    right: 0,
    width: "70%",
    // maxHeight: 360,
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

export default Home;