import React, { useState, useEffect, useRef } from 'react';
import { router, useFocusEffect } from "expo-router";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    Keyboard,
    TouchableWithoutFeedback,
    Image,
    Dimensions,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useGlobalContext } from "../context/GlobalProvider";
import { icons } from "../constants";
import { format, isSameDay, isToday, isYesterday } from "date-fns";

// const screenHeight = Dimensions.get("window").height;
// const tabBarHeight = screenHeight * 0.089 + 11;

const ChatRoom = ({ chatroomID, recipientID, tabBarHeight }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [inputHeight, setInputHeight] = useState(40);
    const flatListRef = useRef(null);

    const { user } = useGlobalContext();

    // Add messages to chat
    useEffect(() => {
        const formatDate = (date) => {
            const [datePart, timePart] = date.split(', ');
            const [month, day, year] = datePart.split('/');
            console.log(`${month}/${day}/${year}T${timePart}`);
            return `${month}/${day}/${year}T${timePart}`;
        };

        const unsubscribe = firestore()
            .collection('chats')
            .doc(chatroomID)
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const fetchedMessages = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const date = new Date(data.createdAt.seconds * 1000);
                    const formattedDate = date.toISOString();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: formattedDate,
                    };
                });
                setMessages(fetchedMessages);
            });

        return unsubscribe;
    }, [chatroomID]);

    useFocusEffect(
        React.useCallback(() => {
            const markChatNotificationsAsRead = async () => {
                if (!user?.accountID) return;

                try {
                    const messagesRef = firestore()
                        .collection(`notifications/${user.accountID}/messages`);

                    const unreadMessagesQuery = messagesRef
                        .where("type", "==", "chat")
                        .where("read", "==", false);

                    const snapshot = await unreadMessagesQuery.get();

                    if (!snapshot.empty) {
                        const batch = firestore().batch();

                        snapshot.docs.forEach((doc) => {
                            batch.update(doc.ref, { read: true });
                        });

                        await batch.commit();
                        console.log("All unread chat notifications marked as read.");
                    } else {
                        console.log("No unread chat notifications found.");
                    }
                } catch (error) {
                    console.error("Error marking chat notifications as read: ", error);
                }
            };

            markChatNotificationsAsRead();
        }, [user, chatroomID])
    );

    // Update read status
    // useEffect(() => {
    //     const markMessagesAsRead = async () => {
    //         const unreadMessagesQuery = firestore()
    //             .collection('chats')
    //             .doc(chatroomID)
    //             .collection('messages')
    //             .where('recipientID', '==', user.uid)
    //             .where('isRead', '==', false);

    //         const snapshot = await unreadMessagesQuery.get();

    //         const batch = firestore().batch();
    //         snapshot.docs.forEach((doc) => {
    //             batch.update(doc.ref, { isRead: true });
    //         });
    //         await batch.commit();
    //     };

    //     markMessagesAsRead();
    // }, [chatroomID]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            _id: Date.now().toString(),
            text: newMessage,
            createdAt: new Date(),
            user: {
                _id: user ? user.email : "Not logged in",
                name: user ? `${user.firstName} ${user.lastName}` : "Not logged in",
            },
            recipientID,
            // isRead: false,
        };

        try {
            await firestore()
                .collection('chats')
                .doc(chatroomID)
                .collection('messages')
                .add(messageData);

            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message: ", error);
        }
    };

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }
    }, [messages]);

    const renderMessageItem = ({ item, index }) => {
        const userLoggedIn = user && item.user._id === user.email;

        const currentMessageDate = new Date(item.createdAt);
        const prevMessageDate = new Date(messages[index - 1]?.createdAt);

        const showTimestamp = index != 0 && !isSameDay(currentMessageDate, prevMessageDate);

        const getDateLabel = (date) => {
            if (isToday(date)) return "Today";
            if (isYesterday(date)) return "Yesterday";
            return format(date, "EEEE, MMM dd");
        };

        return (
            <>
                {showTimestamp && (
                    <Text className="text-white text-[13px] font-pregular self-center m-4">
                        {getDateLabel(prevMessageDate)}
                    </Text>
                )}
                <View>
                    <View
                        style={[
                            userLoggedIn ? styles.sentMessageBubble : styles.receivedMessageBubble,
                            userLoggedIn ? styles.sentMessage : styles.receivedMessage,
                        ]}
                    >
                        <Text className="font-rregular" style={styles.messageText}>
                            {item.text}
                        </Text>
                    </View>
                    {/* <View
                        style={[
                            styles.tail,
                            userLoggedIn ? styles.sentTail : styles.receivedTail,
                        ]}
                    /> */}
                </View>
            </>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={-1 * tabBarHeight + 10}
        >
            {/* <View
                style={styles.headerContainer}
                className="relative flex flex-row items-center w-full"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    className="w-[40px] h-[40px] rounded-xl flex justify-center items-center bg-[#FF9C01] p-1"
                >
                    <Image
                        source={icons.back}
                        style={{ backgroundColor: 'transparent', width: 28, height: 28 }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-2xl text-white font-pbold p-2 bg-transparent">
                    Let's Chat!
                </Text>
            </View> */}
            <View style={[styles.chatContainer, { marginBottom: tabBarHeight }]}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <>
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            inverted
                            keyExtractor={(item) => item.id}
                            renderItem={renderMessageItem}
                            contentContainerStyle={styles.messageList}
                            keyboardDismissMode="on-drag"
                        />
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.textInput, { height: Math.min(120, Math.max(40, inputHeight)), textAlignVertical: "center" }]}
                                className="font-rregular text-white"
                                placeholder="Type a message..."
                                placeholderTextColor="#747474"
                                value={newMessage}
                                onChangeText={setNewMessage}
                                multiline={true}
                                onContentSizeChange={(event) => {
                                    setInputHeight(event.nativeEvent.contentSize.height);
                                }}
                            />
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={sendMessage}
                                disabled={!user}
                            >
                                <Image
                                    source={icons.send}
                                    resizeMode="contain"
                                    className="w-[18px] h-[18px]"
                                />
                            </TouchableOpacity>
                        </View>
                    </>
                </TouchableWithoutFeedback>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        // marginBottom: tabBarHeight,
    },
    messageList: {
        padding: 10,
    },
    receivedMessageBubble: {
        maxWidth: '75%',
        marginVertical: 5,
        padding: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 0,
    },
    sentMessageBubble: {
        maxWidth: '75%',
        marginVertical: 5,
        padding: 12,
        borderRadius: 20,
        borderBottomRightRadius: 0,
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#C3B299',
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#E4E4E4',
    },
    messageText: {
        color: '#000',
        fontSize: 16,
    },
    headerContainer: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#FFF',
        height: 58,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 3,
        backgroundColor: '#09141d',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#747474',
        marginHorizontal: 15,
        marginTop: 5,
    },
    textInput: {
        flex: 1,
        fontSize: 17,
        height: 40,
        padding: 10,
        margin: 5,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    sendButton: {
        marginLeft: 10,
        marginRight: 5,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#3DAA52',
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#FFF',
        fontSize: 17,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 0,
        zIndex: 10,
    },
    tail: {
        width: 0,
        height: 0,
        borderStyle: "solid",
        position: "absolute",
        zIndex: -10,
    },
    sentTail: {
        bottom: -4,
        right: -1,
        borderLeftWidth: 20,
        borderLeftColor: "transparent",
        borderRightWidth: 0,
        borderRightColor: "transparent",
        borderTopWidth: 20,
        borderTopColor: "#FFF",
        zIndex: -10,
        transform: [{ rotate: "-30deg" }],
    },
    receivedTail: {
        bottom: -4,
        left: -1,
        borderRightWidth: 20,
        borderRightColor: "transparent",
        borderLeftWidth: 0,
        borderLeftColor: "transparent",
        borderTopWidth: 20,
        borderTopColor: "#E4E4E4",
        zIndex: -10,
        transform: [{ rotate: "30deg" }],
    },
});

export default ChatRoom;
