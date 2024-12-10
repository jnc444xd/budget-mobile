import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';

export const uploadImageFromLibrary = async (user) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 0,
    });

    if (!result.canceled) {
      const fileUri = result.assets[0].uri;
      const fileName = `${Date.now()}`;
      const reference = storage().ref(`uploads/${user}/${fileName}`);

      await reference.putFile(fileUri);

      const uploadData = {
        type: result.assets[0].type,
        reference,
      };

      return uploadData;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const uploadPhoto = async (photo, user) => {
  try {
    const fileUri = photo.assets[0].uri;
    const fileName = `${Date.now()}`;
    const reference = storage().ref(`uploads/${user}/${fileName}`);

    await reference.putFile(fileUri);

    const uploadData = {
      type: photo.assets[0].type,
      reference,
    };

    return uploadData;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteImage = async (filePath) => {
  try {
    const reference = storage().ref(filePath);
    await reference.delete();
    console.log('Image file deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting image file:', error);
    throw error;
  }
};

export const uploadFile = async (fileUri, userId, fileName) => {
  try {
    const reference = storage().ref(`users/${userId}/${fileName}`);

    await reference.putFile(fileUri);

    const downloadUrl = await reference.getDownloadURL();
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getFileUrl = async (filePath) => {
  try {
    const reference = storage().ref(filePath);
    const downloadUrl = await reference.getDownloadURL();
    return downloadUrl;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
};

// import { storage } from './config';
// import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
// import * as ImagePicker from 'expo-image-picker';

// export const uploadImageFromLibrary = async (user) => {
//   try {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//       allowsEditing: true,
//       aspect: [3, 3],
//       quality: 0,
//     });

//     if (!result.canceled) {
//       const fileUri = result.assets[0].uri;
//       const response = await fetch(fileUri);
//       const blob = await response.blob();

//       const storageRef = ref(storage, `uploads/${user}/${Date.now()}`);

//       await uploadBytes(storageRef, blob);

//       const uploadData = {
//         type: blob.type,
//         storageRef: storageRef
//       }
//       return uploadData;
//     }
//   } catch (error) {
//     console.error('Error uploading file:', error);
//   }
// };

// export const uploadPhoto = async (photo, user) => {
//   try {
//     const fileUri = photo.assets[0].uri
//     const response = await fetch(fileUri);
//     const blob = await response.blob();

//     const storageRef = ref(storage, `uploads/${user}/${Date.now()}`);

//     await uploadBytes(storageRef, blob);

//     const uploadData = {
//       type: blob.type,
//       storageRef: storageRef
//     }
//     return uploadData;
//   } catch (error) {
//     console.error('Error uploading file:', error);
//   }
// };

// export const deleteImage = async (storageRef) => {
//   try {
//     await deleteObject(storageRef);
//     console.log('Image file deleted successfully');
//     return true;
//   } catch (error) {
//     console.error('Error deleting image file:', error);
//     throw new Error(error.message);
//   }
// };

// export const uploadFile = async (fileUri, userId, fileName) => {
//   try {
//     const storageRef = ref(storage, `users/${userId}/${fileName}`);
//     const uploadedFile = await uploadBytes(storageRef, fileUri);
//     const downloadUrl = await getDownloadURL(uploadedFile.ref);
//     return downloadUrl;
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     throw new Error(error.message);
//   }
// };

// export const getFileUrl = async (ref) => {
//   try {
//     const downloadUrl = await getDownloadURL(ref);
//     return downloadUrl;
//   } catch (error) {
//     console.error('Error getting download URL:', error);
//     throw new Error(error.message);
//   }
// };