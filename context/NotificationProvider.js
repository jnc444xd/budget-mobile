import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { router, usePathname } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as Device from "expo-device";
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { onSnapshot, query, collection, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { updateUserPushToken, getUnreadNotifications, markNotificationAsRead } from '../firebase/database';
import { useGlobalContext } from "./GlobalProvider";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [notifLength, setNotifLength] = useState(0);
  const [newMessageLength, setNewMessageLength] = useState(0);
  const [groupedNotifications, setGroupedNotifications] = useState([]);

  const { user } = useGlobalContext();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!user?.accountID) return;

    // Reference the messages sub-collection
    const messagesRef = collection(db, `notifications/${user.accountID}/messages`);

    // Query to get unread messages
    const q = query(
      messagesRef,
      where("read", "==", false) // Filter for unread messages
    );

    // Listen to real-time changes in the messages sub-collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(newNotifications); // Update state with new notifications
      setNotifLength(newNotifications.length); // Update unread count
    });

    // Cleanup listener on component unmount or user change
    return () => unsubscribe();
  }, [user]);

  // Fetch unread notifications for a specific account
  const fetchUnreadNotifications = async () => {
    if (!user) return;

    try {
      const notificationData = await getUnreadNotifications(user?.accountID);
      setNotifications(notificationData);
      setNotifLength(notificationData.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const processNotifications = (notifications) => {
    let chatCount = 0;
    const processedNotifications = notifications.reduce((result, item) => {
      if (item?.type === "chat") {
        chatCount += 1;
        return result;
      }
      result.push(item);
      return result;
    }, []);

    if (chatCount > 0) {
      processedNotifications.unshift({
        id: "chat-group",
        type: "chat",
        title: "Chat Notifications",
        body: `You have ${chatCount} new messages`,
      });
    }

    return { processedNotifications, chatCount };
  };

  // const groupedNotifications = processNotifications(notifications).processedNotifications;
  // const newMessageLength = processNotifications(notifications).chatCount;

  useEffect(() => {
    const { processedNotifications, chatCount } = processNotifications(notifications);
    setGroupedNotifications(processedNotifications);
    setNewMessageLength(chatCount);
  }, [notifications]);

  // // Mark specific notifications as read
  // const markNotificationsAsRead = async (accountID, notificationIDs) => {
  //   try {
  //     if (Array.isArray(notificationIDs)) {
  //       await Promise.all(
  //         notificationIDs.map((id) => markNotificationAsRead(accountID, id))
  //       );
  //     } else {
  //       await markNotificationAsRead(accountID, notificationIDs);
  //     }
  //     await fetchUnreadNotifications(accountID); // Refresh notifications after marking as read
  //   } catch (error) {
  //     console.error("Error marking notifications as read:", error);
  //   }
  // };

  // // Mark all notifications as read
  // const markAllNotificationsAsRead = async (accountID) => {
  //   try {
  //     const notificationIDs = notifications.map((notif) => notif.id);
  //     await markNotificationsAsRead(accountID, notificationIDs);
  //   } catch (error) {
  //     console.error("Error marking all notifications as read:", error);
  //   }
  // };

  // // Reset notifications (e.g., clear state)
  // const resetNotifications = () => {
  //   setNotifications([]);
  //   setNotifLength(0);
  // };

  useEffect(() => {
    fetchUnreadNotifications();
  }, [user]);

  useEffect(() => {
    const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

    TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data: { notification }, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('Received a notification in the background:', notification);
    });

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification Received:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification Clicked:", response);
      const { data } = response.notification.request.content;
      console.log("response data: ", data.type);

      // Map notification types to paths
      const typeToPathMap = {
        chat: "/chat",
        maintenance: "/overview",
        rent: "/account",
        default: "/home",
      };

      const targetPath = typeToPathMap[data.type] || typeToPathMap.default;
      const currentPath = usePathname(); // Get the current path

      if (currentPath === targetPath) {
        // Reload the current page logic
        console.log("Reloading the current page.");
        router.replace(targetPath); // Replaces the current route with the same one
      } else {
        // Navigate to the target path
        router.push(targetPath);
      }
    });

    // responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    //   console.log("Notification Clicked:", response);
    //   const { data } = response.notification.request.content;
    //   console.log("response data: ", data.type);

    //   switch (data.type) {
    //     case "chat":
    //       router.push("/chat");
    //       break;
    //     case "maintenance":
    //       router.push("/overview");
    //       break;
    //     case "rent":
    //       router.push("/account");
    //       break;
    //     default:
    //       router.push("/home");
    //       break;
    //   }
    // });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (user?.uid) {
      const handleTokenUpdate = async () => {
        try {
          const expoPushToken = await registerForPushNotificationsAsync();
          await updateUserPushToken(user.uid, expoPushToken);
          console.log("Expo Push Token Updated!");
        } catch (error) {
          console.error("Error updating push token:", error);
        }
      };

      handleTokenUpdate();
    }
  }, [user]);

  const handleRegistrationError = (errorMessage) => {
    console.log(errorMessage);
    throw new Error(errorMessage);
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const existingStatus = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (!finalStatus.granted) {
        const status = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (!finalStatus.granted) {
        console.log("Permission not granted");
        handleRegistrationError("Permission not granted to get token for push notification!");
        return;
      }

      // const projectID = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      const projectID = Constants.expoConfig.extra.eas.projectId;
      if (!projectID) {
        console.log("Project ID not found");
        handleRegistrationError("Project ID not found");
      }
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: projectID });
        const pushToken = tokenData.data;
        return pushToken;
      } catch (error) {
        console.log("Error getting push token using project id");
        handleRegistrationError(`${error}`);
      }
    } else {
      console.log("Must use physical device for push notifications");
      handleRegistrationError("Must use physical device for push notifications");
    }
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      groupedNotifications,
      notifLength,
      newMessageLength,
      fetchUnreadNotifications,
      // markNotificationsAsRead,
      // markAllNotificationsAsRead,
      // resetNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;