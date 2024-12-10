import { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import Constants from "expo-constants";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  Switch,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import Toast from 'react-native-toast-message'
import { images, icons } from "../../../constants";
import { addMaintenanceRequest } from "../../../firebase/database";
import { uploadPhoto, getFileUrl, deleteImage } from "../../../firebase/storage";
import { CustomButton, FormField } from "../../../components";
import { useGlobalContext } from "../../../context/GlobalProvider";
import { Calendar } from "react-native-calendars";
import Background from "../../../components/Background";
import Header from "../../../components/Header";

const screenHeight = Dimensions.get("window").height;
const tabBarHeight = screenHeight * 0.089 + 16;

const Create = () => {
  const [imagePaths, setImagePaths] = useState([null, null, null]);
  const [imageRef, setImageRef] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    location: ""
  });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState({});
  const [timeSlots, setTimeSlots] = useState({});
  const [todayDateString, setTodayDateString] = useState('');

  const { user, loading, isLogged } = useGlobalContext();
  const unitNumber = user ? user.unit : null;
  const creatorID = user ? user.uid : null;
  const adminUID = Constants.expoConfig.extra.adminUID;

  const toggleSwitch = () => setIsUrgent(previousState => !previousState);

  const handleDeleteImage = (index, ref) => {
    setImagePaths(currentImages => currentImages.filter((_, i) => i !== index));

    try {
      deleteImage(ref);
      console.log("Image deleted successfully");
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  // User take photo to upload
  const takePhoto = async (index) => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.granted) {
      const photoResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 3],
        quality: 0,
      })

      if (!photoResult.canceled) {
        setIsLoading(true);
        try {
          const uploadResult = await uploadPhoto(photoResult, user.accountID);

          if (uploadResult) {
            console.log("Upload result: ", uploadResult);
            const photoURL = await getFileUrl(uploadResult.reference.path);

            setImagePaths((prevPaths) => {
              const updatedPaths = [...prevPaths];
              updatedPaths[index] = photoURL;
              return updatedPaths;
            });
          }
        } catch (error) {
          console.error("Photo upload failed:", error);
          Toast.show({
            type: "error",
            text1: "😕 An error occurred while uploading your photo. Please try again."
          });
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Camera permission is required to take photos. If you would like to enable it in your device settings, please press here.",
        onPress: () => Linking.openSettings()
      });
    }
  };

  // const takePhoto = async (index) => {
  //   const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

  //   if (cameraPermission.granted) {
  //     const photoResult = await ImagePicker.launchCameraAsync({
  //       allowsEditing: true,
  //       aspect: [3, 3],
  //       quality: 0,
  //     });

  //     if (!photoResult.canceled) {
  //       setIsLoading(true);
  //       const uploadResult = await uploadPhoto(photoResult, user.accountID);
  //       if (uploadResult) {
  //         console.log("upload result: ", uploadResult);
  //         setImageRef((prevRefs) => {
  //           const updatedRefs = [...prevRefs];
  //           updatedRefs[index] = uploadResult.reference.path;
  //           return updatedRefs;
  //         });
  //       }
  //       setTimeout(() => {
  //         setIsLoading(false);
  //       }, 3000);
  //     }
  //   } else {
  //     Alert.alert("Camera Permission", "Camera permission is required to take photos!");
  //   }
  // };


  // const fetchImageURL = async (storageRef) => {
  //   try {
  //     const url = await getFileUrl(storageRef);
  //     return url;
  //   } catch (error) {
  //     console.error("Failed to complete upload: ", error);
  //   }
  // };

  // const fetchAllImageURLs = async () => {
  //   if (imageRef.every((ref) => ref === null)) return;

  //   try {
  //     const promises = imageRef.map((ref) => (ref ? fetchImageURL(ref) : null));
  //     const results = await Promise.all(promises);
  //     console.log("results: ", results);
  //     setImagePaths(results);
  //     console.log("All images have been successfully loaded!");
  //   } catch (error) {
  //     console.error("Error fetching image URLs:", error);
  //     Alert.alert("Error", "Failed to complete Upload, please try again.");
  //   } finally {
  //     setUploadSuccess(true);
  //   }
  // };

  // useEffect(() => {
  //   console.log(imagePaths);
  // }, []);

  // useEffect(() => {
  //   fetchAllImageURLs();
  //   console.log("updated: ", imagePaths);
  // }, [imageRef]);

  const submit = async () => {
    if (form.description === "" || form.location === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const currentDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' });
      const timeStamp = new Date().toLocaleString("en-US", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const maintenanceRequestData = {
        unit: unitNumber,
        subject: form.subject,
        description: form.description,
        location: form.location,
        availability: selectedDates,
        urgent: isUrgent,
        media: imagePaths,
        isComplete: false,
        createdAt: currentDate,
        timeStamp: timeStamp,
        scheduled: false,
        arrivalWindow: "",
        arrivalNotes: "",
        invoicePaid: false,
        adminID: adminUID,
        creatorID: creatorID
      };
      const result = await addMaintenanceRequest(maintenanceRequestData);

      setIsLoading(false);

      if (result) {
        Toast.show({
          type: "success",
          text1: "Request submitted successfully! 🎉"
        });
      }

      router.replace("/overview");
    } catch (error) {
      setIsLoading(false);
      console.error("Error", error.message);
      Toast.show({
        type: "error",
        text1: "😕 An error occurred. Please check all fields and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitConfirmation = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you are ready to submit?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed")
        },
        {
          text: "OK",
          onPress: () => submit()
        }
      ]
    );
  };

  const availableTimeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM',
    'Any Time',
  ];

  useEffect(() => {
    const getToday = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setTodayDateString(getToday());
  }, []);

  const onDayPress = (day) => {
    const dateString = day.dateString;

    setSelectedDates((prevDates) => {
      const newDates = { ...prevDates };
      if (newDates[dateString]) {
        delete newDates[dateString];
      } else {
        newDates[dateString] = { timeSlots: [] };
      }
      return newDates;
    });
  };

  const toggleTimeSlot = (date, slot) => {
    setSelectedDates((prevDates) => {
      const updatedDates = { ...prevDates };

      if (!Array.isArray(updatedDates[date])) {
        updatedDates[date] = [];
      }

      if (updatedDates[date].includes(slot)) {
        updatedDates[date] = updatedDates[date].filter((s) => s !== slot);
      } else {
        updatedDates[date] = [...updatedDates[date], slot];
      }

      return updatedDates;
    });
  };

  const markedDates = Object.keys(selectedDates).reduce((acc, date) => {
    acc[date] = { selected: true, marked: true, selectedColor: '#36BC6D' };
    return acc;
  }, {});

  return (
    <SafeAreaView edges={["left", "right", "bottom", "top"]} className="flex-1 bg-[#09141d]">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={-20}
      >
        <Header
          back={true}
        />
        <Text className="text-2xl text-[#FFA500] font-psemibold bg-transparent self-start ml-6 mb-6 mt-6">
          Maintenance Request Form
        </Text>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight + 50 }}
          keyboardDismissMode="on-drag"
        >
          <View className="w-full h-full flex justify-center h-full px-4">
            <View>
              <Text className="text-[16px] text-white pt-1 font-psemibold">Urgent?{"\n"}</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#FFF" }}
                thumbColor={isUrgent ? "#36BC6D" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isUrgent}
              />
            </View>
            <FormField
              title="Subject"
              value={form.subject}
              handleChangeText={(e) => setForm({ ...form, subject: e })}
              otherStyles="mt-7"
            />
            <FormField
              title="Description"
              value={form.description}
              handleChangeText={(e) => setForm({ ...form, description: e })}
              otherStyles="mt-7"
            />
            <FormField
              title="Location (ex. 2nd Floor Bathroom)"
              value={form.location}
              handleChangeText={(e) => setForm({ ...form, location: e })}
              otherStyles="mt-7"
            />
            <Text className="text-[16px] text-white mt-10 mb-4 font-psemibold">
              Please Select Availability:
            </Text>
            <View style={styles.calendarContainer} className="rounded-lg">
              <Calendar
                onDayPress={onDayPress}
                markedDates={markedDates}
                markingType="multi-dot"
                initialDate={todayDateString ? todayDateString : null}
                minDate={todayDateString ? todayDateString : null}
              />
              {Object.keys(selectedDates).length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {Object.keys(selectedDates).map((date) => (
                    <View key={date} style={styles.dateContainer}>
                      <Text className="text-base text-gray-500 font-psemibold text-center mb-1">{date}</Text>
                      <View style={styles.timeSlotsContainer}>
                        {availableTimeSlots.map((slot) => (
                          <TouchableOpacity
                            key={slot}
                            onPress={() => toggleTimeSlot(date, slot)}
                            style={[
                              styles.timeSlot,
                              Array.isArray(selectedDates[date]) && selectedDates[date].includes(slot) && styles.selectedTimeSlot,
                            ]}
                          >
                            <Text
                              style={[
                                styles.timeSlotText,
                                Array.isArray(selectedDates[date]) && selectedDates[date].includes(slot) && styles.selectedTimeSlotText,
                              ]}
                            >
                              {slot}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text className="text-sm font-pregular mb-6" style={styles.noSelectionText}>No dates selected</Text>
              )}
            </View>
            <Text className="text-[16px] text-white mb-4 mt-8 font-psemibold">
              Please Add Photos:
            </Text>
            {
              isLoading &&
              <View className="w-full flex-row justify-center mt-4">
                <Image
                  source={icons.loading}
                  className="w-[50] h-[50]"
                  resizeMode="contain"
                />
              </View>
            }
            <View className="flex flex-row justify-center space-x-4 mt-2 mb-10">
              {
                !isLoading &&
                imagePaths.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => takePhoto(index)}
                    activeOpacity={0.7}
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <Image
                      source={photo ? { uri: photo } : icons.photo}
                      className="w-[100px] h-[100px]"
                    />
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>
          <View className="w-full flex justify-end items-center">
            <CustomButton
              title="Submit"
              handlePress={submitConfirmation}
              containerStyles="w-[100]"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  horizontalScroll: {
    marginTop: 20,
  },
  dateContainer: {
    marginTop: 5,
    backgroundColor: '#ffffff',
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 180,
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  timeSlot: {
    width: 150,
    padding: 10,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FF9C01',
    backgroundColor: '#ffffff',
  },
  selectedTimeSlot: {
    backgroundColor: '#36BC6D',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#36BC6D',
  },
  timeSlotText: {
    color: '#FF9C01',
  },
  selectedTimeSlotText: {
    color: '#ffffff',
  },
  noSelectionText: {
    marginTop: 20,
    textAlign: 'center',
    color: 'red',
  },
  submitButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FF9C01',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FFF',
    marginTop: 20,
  },
});

export default Create;