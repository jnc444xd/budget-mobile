import React, { createContext, useContext, useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {

      try {
        if (firebaseUser) {
          const userDoc = await firestore()
            .collection("users")
            .doc(firebaseUser.uid)
            .get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            const fullName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              fullName: fullName,
              unit: userData.unit,
              accountID: userData.accountID,
              isAdmin: userData.isAdmin,
            });
            setIsLogged(true);
          } else {
            console.error("No user data found in Firestore");
            setUser(null);
            setIsLogged(false);
          }
        } else {
          setUser(null);
          setIsLogged(false);
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
        setUser(null);
        setIsLogged(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        logout,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
