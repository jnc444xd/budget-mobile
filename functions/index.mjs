import {
    onDocumentCreated,
    onDocumentUpdated
} from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize the Firebase Admin app
const adminApp = initializeApp();

// Get Firestore service
const db = getFirestore(adminApp);

// New chat message
export const newMessagePushNotification = onDocumentCreated("chats/{chatroomID}/messages/{messageID}", async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    const messageData = snapshot.data();
    const recipientID = messageData.recipientID;

    const userRef = db.doc(`users/${recipientID}`);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userDoc.exists) {
        console.log('Recipient not found:', recipientID);
        return null;
    }

    if (userData.expoPushToken) {
        const message = {
            to: userData.expoPushToken,
            sound: "default",
            title: messageData.user.name,
            body: "New message",
            data: { type: "chat" }
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        console.log("fetch request sent");
    } else {
        console.log('No push token for user: ', recipientID);
    }

    await db.collection(`notifications/${userData.accountID}/messages`).add({
        type: "chat",
        title: "New Message",
        body: "Go to chat",
        nav: "chat",
        timestamp: Timestamp.now(),
        read: false,
    });
});

// New maintenance request
export const newRequestPushNotification = onDocumentCreated("maintenance-requests/{requestID}", async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    const requestData = snapshot.data();
    const recipientID = requestData.adminID;

    const userRef = db.doc(`users/${recipientID}`);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userDoc.exists) {
        console.log('Recipient not found:', recipientID);
        return null;
    }

    if (userData.expoPushToken) {
        const message = {
            to: userData.expoPushToken,
            sound: 'default',
            title: "New Maintenance Request",
            body: `Unit ${requestData.unit}`,
            data: { type: "maintenance" }
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        console.log("fetch request sent");
    } else {
        console.log('No push token for user: ', recipientID);
    }

    await db.collection(`notifications/${userData.accountID}/messages`).add({
        type: "maintenance",
        title: "New Maintenance Request",
        body: `Unit ${requestData.unit}`,
        nav: "allMaintenanceRequests",
        timestamp: Timestamp.now(),
        read: false,
    });
});

// Updated maintenance request
export const updatedRequestPushNotification = onDocumentUpdated("maintenance-requests/{requestID}", async (event) => {
    const requestData = event.data.after.data();

    if (!requestData) {
        console.log("No data associated with the event");
        return;
    }

    console.log(requestData);
    // const requestData = snapshot.data();
    const recipientID = requestData.creatorID;
    const isInvoicePaid = requestData.invoicePaid;
    const isComplete = requestData.isComplete;

    const userRef = db.doc(`users/${recipientID}`);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userDoc.exists) {
        console.log('Recipient not found:', recipientID);
        return null;
    }

    let notificationMessage = null;

    if (userData.expoPushToken && !isInvoicePaid && !isComplete) {
        const message = {
            to: userData.expoPushToken,
            sound: 'default',
            title: "Maintenance Request Scheduled",
            body: "View details",
            data: { type: "maintenance" }
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        console.log("fetch request sent");

        notificationMessage = {
            type: "maintenance",
            title: "Maintenance Request Update",
            body: "Scheduled! View details",
            nav: "overview",
        };
    } else if (userData.expoPushToken && isInvoicePaid && isComplete) {
        const message = {
            to: userData.expoPushToken,
            sound: 'default',
            title: "Maintenance Request Complete",
            body: "Successfully completed! Please contact management if you have any further issues.",
            data: { type: "maintenance" }
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        console.log("fetch request sent");

        notificationMessage = {
            type: "maintenance",
            title: "Maintenance Request Update",
            body: "Completed successfully!",
            nav: "completed",
        };
    } else {
        console.log("Unable to send push notification for this");
    }

    if (notificationMessage) {
        await db.collection(`notifications/${userData.accountID}/messages`).add({
            ...notificationMessage,
            timestamp: Timestamp.now(),
            read: false,
        });

        console.log("Notification document created");
    }
});

// New announcement
export const newAnnouncementPushNotification = onDocumentCreated("notices/{noticeID}", async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    const noticeData = snapshot.data();

    try {
        const usersSnapshot = await db.collection('users').get();

        const pushNotifications = [];
        const notificationPromises = [];

        usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();

            if (userData.expoPushToken) {
                const message = {
                    to: userData.expoPushToken,
                    sound: 'default',
                    title: "New Announcement",
                    body: noticeData.title || "Check out the latest announcement!",
                    data: { type: "announcement" },
                };

                pushNotifications.push(message);
            }

            notificationPromises.push(
                db.collection(`notifications/${userData.accountID}/messages`).add({
                    type: "announcement",
                    title: "New Announcement",
                    body: "View on home screen",
                    nav: "home",
                    timestamp: Timestamp.now(),
                    read: false,
                })
            );
        });

        if (pushNotifications.length > 0) {
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pushNotifications),
            });

            console.log("Push notifications sent successfully");
        } else {
            console.log("No users with expoPushToken found");
        }

        await Promise.all(notificationPromises);
        console.log("In-app notifications created successfully");
    } catch (error) {
        console.error("Error sending notifications: ", error);
    }
});

// New community board post
export const newCommunityBoardPushNotification = onDocumentCreated("community-board/{messageID}", async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    const postData = snapshot.data();

    try {
        const usersSnapshot = await db.collection('users').get();

        const pushNotifications = [];
        const notificationPromises = [];

        usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();

            if (userData.expoPushToken) {
                const message = {
                    to: userData.expoPushToken,
                    sound: 'default',
                    title: "New Community Board Post",
                    body: postData.subject || "Check it out!",
                    data: { type: "announcement" },
                };

                pushNotifications.push(message);
            }

            notificationPromises.push(
                db.collection(`notifications/${userData.accountID}/messages`).add({
                    type: "community-board",
                    title: "New Community Board Post",
                    body: "View on home screen",
                    nav: "home",
                    timestamp: Timestamp.now(),
                    read: false,
                })
            );
        });

        if (pushNotifications.length > 0) {
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pushNotifications),
            });

            console.log("Push notifications sent successfully");
        } else {
            console.log("No users with expoPushToken found");
        }

        await Promise.all(notificationPromises);
        console.log("In-app notifications created successfully");
    } catch (error) {
        console.error("Error sending notifications: ", error);
    }
});

export const remindRentDue = onSchedule("every day 18:00", async (event) => {
    try {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const fiveDaysBeforeNextMonth = new Date(nextMonth);
        fiveDaysBeforeNextMonth.setDate(fiveDaysBeforeNextMonth.getDate() - 7);
        console.log("Five days before: ", fiveDaysBeforeNextMonth);

        if (
            today.getDate() !== fiveDaysBeforeNextMonth.getDate() ||
            today.getMonth() !== fiveDaysBeforeNextMonth.getMonth() ||
            today.getFullYear() !== fiveDaysBeforeNextMonth.getFullYear()
        ) {
            console.log("Not five days before the next month. Exiting...");
            return null;
        }

        const leasesSnapshot = await db.collection("leases").get();
        const leases = leasesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        for (const lease of leases) {
            const { payments, endDate, unit } = lease;
            const leaseEndDate = new Date(endDate);

            if (leaseEndDate < today) {
                continue;
            }

            const nextMonthName =
                nextMonth.toLocaleString("default", { month: "long" }) +
                ` ${nextMonth.getFullYear()}`;
            const paymentInfo = payments?.[nextMonthName];

            if (paymentInfo && paymentInfo.isPaid === false) {
                const tenantsSnapshot = await db.collection("users")
                    .where("unit", "==", unit)
                    .get();

                if (!tenantsSnapshot.empty) {
                    for (const tenantDoc of tenantsSnapshot.docs) {
                        const tenantData = tenantDoc.data();

                        if (tenantData?.expoPushToken) {
                            const message = {
                                to: tenantData.expoPushToken,
                                sound: "default",
                                title: "Rent Reminder",
                                body: `Rent for unit ${unit} is due soon`,
                                data: { type: "rent" },
                            };

                            await fetch("https://exp.host/--/api/v2/push/send", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Accept: "application/json",
                                },
                                body: JSON.stringify(message),
                            });

                            console.log(`Notification sent to tenant with ID: ${tenantDoc.id} for lease ID: ${lease.id}`);
                        } else {
                            console.log(`No push token for tenant with ID: ${tenantDoc.id}`);
                        }

                        await db.collection(`notifications/${tenantData.accountID}/messages`).add({
                            type: "rent",
                            title: "Rent Reminder",
                            body: `Your rent for unit ${unit} is due soon`,
                            nav: "account",
                            timestamp: Timestamp.now(),
                            read: false,
                        });

                        console.log(`In-app notification created for tenant with ID: ${tenantDoc.id}`);
                    }
                } else {
                    console.log(`No tenants found for unit ${unit}`);
                }
            }
        }

        console.log("Rent reminder notification completed.");
    } catch (error) {
        console.error("Error in rent reminder function:", error);
    }
});