import firestore from '@react-native-firebase/firestore';

const usersCollection = firestore().collection('users');

export const addUser = async (user) => {
  try {
    const userRef = await usersCollection.add(user);
    return { id: userRef.id, ...user };
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export const getUser = async (userID) => {
  try {
    const userDoc = await usersCollection.doc(userID).get();
    if (userDoc.exists) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.error("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const snapshot = await usersCollection.get();
    const usersList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return usersList;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateUser = async (userID, userData) => {
  try {
    await usersCollection.doc(userID).update(userData);
    return { id: userID, ...userData };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const updateUserPushToken = async (userID, expoPushToken) => {
  try {
    await usersCollection.doc(userID).update({ expoPushToken });
    return { id: userID, expoPushToken };
  } catch (error) {
    console.error("Error updating user push token:", error);
    throw error;
  }
};

export const deleteUser = async (userID) => {
  try {
    await usersCollection.doc(userID).delete();
    return userID;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const addMaintenanceRequest = async (maintenanceRequestData) => {
  try {
    const maintenanceRequestRef = firestore().collection("maintenance-requests").doc();
    await maintenanceRequestRef.set(maintenanceRequestData);
    return { id: maintenanceRequestRef.id, ...maintenanceRequestData };
  } catch (error) {
    console.error("Error adding maintenance request:", error);
    throw error;
  }
};

export const getMaintenanceRequestsByUnit = async (unit) => {
  try {
    const requestsQuery = await firestore()
      .collection("maintenance-requests")
      .where("unit", "==", unit)
      .get();

    const docs = requestsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return docs;
  } catch (error) {
    console.error("Error fetching maintenance requests by unit:", error);
    throw error;
  }
};

export const getAllMaintenanceRequests = async () => {
  try {
    const requestDocs = await firestore().collection("maintenance-requests").get();
    const docs = requestDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return docs;
  } catch (error) {
    console.error("Error fetching all maintenance requests:", error);
    throw error;
  }
};

export const updateMaintenanceRequest = async (updateID, updateData) => {
  try {
    const updateRef = firestore().collection("maintenance-requests").doc(updateID);
    await updateRef.update(updateData);
    return { id: updateID, ...updateData };
  } catch (error) {
    console.error("Error updating maintenance request:", error);
    throw error;
  }
};

export const deleteMaintenanceRequest = async (requestID) => {
  try {
    const requestRef = firestore().collection("maintenance-requests").doc(requestID);
    await requestRef.delete();
    return requestID;
  } catch (error) {
    console.error("Error deleting maintenance request:", error);
    throw error;
  }
};

export const addNotice = async (noticeData) => {
  try {
    const noticeRef = firestore().collection("notices").doc();
    await noticeRef.set(noticeData);
    return { id: noticeRef.id, ...noticeData };
  } catch (error) {
    console.error("Error adding notice:", error);
    throw error;
  }
};

export const getNotices = async () => {
  try {
    const noticesRef = await firestore().collection("notices").get();
    const docs = noticesRef.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return docs;
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    throw error;
  }
};

export const deleteNotice = async (noticeID) => {
  try {
    const noticeRef = firestore().collection("notices").doc(noticeID);
    await noticeRef.delete();
    return noticeID;
  } catch (error) {
    console.error("Error deleting notice:", error);
    throw error;
  }
};

export const addLease = async (leaseData) => {
  try {
    const leaseRef = firestore().collection("leases").doc();
    await leaseRef.set(leaseData);
    return { id: leaseRef.id, ...leaseData };
  } catch (error) {
    console.error("Error adding lease:", error);
    throw error;
  }
};

export const getLease = async (unit) => {
  try {
    const leaseQuery = await firestore()
      .collection("leases")
      .where("unit", "==", unit)
      .get();

    const leases = leaseQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return leases;
  } catch (error) {
    console.error("Error fetching lease by unit:", error);
    throw error;
  }
};

export const getAllLeases = async () => {
  try {
    const leaseDocs = await firestore().collection("leases").get();
    const docs = leaseDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return docs;
  } catch (error) {
    console.error("Error fetching all leases:", error);
    throw error;
  }
};

export const updateRentPaid = async (leaseID, month, isPaid) => {
  try {
    const updateRef = firestore().collection("leases").doc(leaseID);
    const updateField = `payments.${month}.isPaid`;
    await updateRef.update({
      [updateField]: isPaid,
    });
    return { id: leaseID, updatedField: month, isPaid };
  } catch (error) {
    console.error("Error updating lease:", error);
    throw error;
  }
};

export const updateRentAmount = async (leaseID, month, rentAmount) => {
  try {
    const updateRef = firestore().collection("leases").doc(leaseID);
    const updateField = `payments.${month}.rentAmount`;
    await updateRef.update({
      [updateField]: rentAmount,
    });
    return { id: leaseID, updatedField: month, rentAmount };
  } catch (error) {
    console.error("Error updating lease:", error);
    throw error;
  }
};

export const addCommunityBoardMessage = async (messageData) => {
  try {
    const messageRef = firestore().collection("community-board").doc();
    await messageRef.set(messageData);
    return { id: messageRef.id, ...messageData };
  } catch (error) {
    console.error("Error adding community board message:", error);
    throw error;
  }
};

export const getAllCommunityBoardMessages = async () => {
  try {
    const messageDocs = await firestore().collection("community-board").get();
    const docs = messageDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return docs;
  } catch (error) {
    console.error("Error fetching all community board messages:", error);
    throw error;
  }
};

export const deleteCommunityBoardMessage = async (messageID) => {
  try {
    const messageRef = firestore().collection("community-board").doc(messageID);
    await messageRef.delete();
    return messageID;
  } catch (error) {
    console.error("Error deleting community board message:", error);
    throw error;
  }
};

export const getUnreadNotifications = async (accountID) => {
  try {
    if (!accountID) {
      console.error("Account ID is required");
    }

    const unreadMessagesSnapshot = await firestore()
      .collection(`notifications/${accountID}/messages`)
      .where("read", "==", false)
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    const unreadMessages = unreadMessagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return unreadMessages;
  } catch (error) {
    console.error(`Error fetching unread notifications for account ID ${accountID}:`, error);
    throw error;
  }
};

export const markNotificationAsRead = async (accountID, notificationID) => {
  try {
    if (!accountID) {
      console.error("Account ID is required");
    }
    if (!notificationID) {
      console.error("Notification ID is required");
    }

    const notificationRef = firestore().doc(
      `notifications/${accountID}/messages/${notificationID}`
    );

    await notificationRef.update({ read: true });

    console.log(`Notification ${notificationID} marked as read`);
    return { success: true, message: `Notification ${notificationID} updated` };
  } catch (error) {
    console.error(`Error updating notification ${notificationID} for account ID ${accountID}:`, error);
    throw error;
  }
};

// export const addUser = async (user) => {
//   try {
//     const userRef = doc(collection(db, "users"));
//     await setDoc(userRef, user);
//     return { id: userRef.id, ...user };
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const getUser = async (userID) => {
//   try {
//     const userDoc = doc(db, "users", userID);
//     console.log("db: ", db, "userID: ", userID, "userDoc: ", userDoc);
//     const foundUser = await getDoc(userDoc);
//     console.log("found user: ", foundUser);
//     if (foundUser.exists()) {
//       return foundUser.data();
//     } else {
//       console.error("No such user!", error);
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const getAllUsers = async () => {
//   try {
//     const usersCollectionRef = collection(db, "users");
//     const userDocs = await getDocs(usersCollectionRef);
//     const usersList = userDocs.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));
//     return usersList;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const updateUser = async (userID, userData) => {
//   try {
//     const userRef = doc(db, "users", userID);
//     await updateDoc(userRef, userData);
//     return { id: userID, ...userData };
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const updateUserPushToken = async (userID, expoPushToken) => {
//   try {
//     const userRef = doc(db, "users", userID);
//     await updateDoc(userRef, { expoPushToken });
//     return { id: userID, expoPushToken };
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const deleteUser = async (userId) => {
//   try {
//     const userRef = doc(db, "users", userId);
//     await deleteDoc(userRef);
//     return userId;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const addMaintenanceRequest = async (maintenanceRequestData) => {
//   try {
//     const maintenanceRequestRef = doc(collection(db, "maintenance-requests"));
//     await setDoc(maintenanceRequestRef, maintenanceRequestData);
//     return { id: maintenanceRequestRef.id, ...maintenanceRequestData };
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const getMaintenanceRequestsByUnit = async (unit) => {
//   let docs = [];

//   try {
//     const requestsRef = collection(db, "maintenance-requests");
//     const requestsQuery = query(requestsRef, where("unit", "==", unit));

//     const requestDocs = await getDocs(requestsQuery);
//     requestDocs.forEach((doc) => {
//       docs.push({
//         id: doc.id,
//         ...doc.data()
//       });
//     });
//   } catch (error) {
//     console.error(error);
//   }

//   return docs;
// };

// export const getAllMaintenanceRequests = async () => {
//   let docs = [];

//   try {
//     const requestsRef = collection(db, "maintenance-requests");
//     const requestDocs = await getDocs(requestsRef);
//     requestDocs.forEach((doc) => {
//       docs.push({
//         id: doc.id,
//         ...doc.data()
//       });
//     });
//   } catch (error) {
//     console.error(error);
//   }

//   return docs;
// };

// export const updateMaintenanceRequest = async (updateID, updateData) => {
//   try {
//     const updateRef = doc(db, "maintenance-requests", updateID);
//     await updateDoc(updateRef, updateData);
//     return { id: updateID, ...updateData };
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const deleteMaintenanceRequest = async (requestID) => {
//   try {
//     const requestRef = doc(db, "maintenance-requests", requestID);
//     await deleteDoc(requestRef);
//     return requestID;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const addNotice = async (noticeData) => {
//   try {
//     const noticeRef = doc(collection(db, "notices"));
//     await setDoc(noticeRef, noticeData);
//     return { id: noticeRef.id, ...noticeData };
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const getNotices = async () => {
//   try {
//     const noticesRef = collection(db, "notices");
//     const noticesData = await getDocs(noticesRef);
//     const docs = noticesData.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));
//     return docs;
//   } catch (error) {
//     console.error("Failed to fetch notices");
//   }
// };

// export const deleteNotice = async (noticeID) => {
//   try {
//     const noticeRef = doc(db, "notices", noticeID);
//     await deleteDoc(noticeRef);
//     return noticeID;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const addLease = async (leaseData) => {
//   try {
//     const leaseRef = doc(collection(db, "leases"));
//     await setDoc(leaseRef, leaseData);
//     return { id: leaseRef.id, ...leaseData };
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const getLease = async (unit) => {
//   try {
//     const leaseRef = collection(db, "leases");
//     const leaseQuery = query(leaseRef, where("unit", "==", unit));
//     const leaseDoc = await getDocs(leaseQuery);
//     const leases = leaseDoc.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));
//     return leases;
//   } catch (error) {
//     console.error(error);
//   }
// };

// export const getAllLeases = async () => {
//   let docs = [];

//   try {
//     const requestsRef = collection(db, "leases");
//     const requestDocs = await getDocs(requestsRef);
//     requestDocs.forEach((doc) => {
//       docs.push({
//         id: doc.id,
//         ...doc.data()
//       });
//     });
//   } catch (error) {
//     console.error(error);
//   }

//   return docs;
// };

// export const updateLease = async (leaseID, month, isPaid) => {
//   try {
//     const updateRef = doc(db, "leases", leaseID);
//     const updateField = `payments.${month}.isPaid`;
//     await updateDoc(updateRef, {
//       [updateField]: isPaid
//     });
//     return { id: leaseID, updatedField: month, isPaid };
//   } catch (error) {
//     console.error(error);
//   }
// };