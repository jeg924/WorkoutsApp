import React from "react";
import firebase from "firebase";
import {
  View,
  Text,
  Button,
  Image,
  Dimensions,
  TouchableHighlight,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

export default function EditProfile({ navigation, route }) {
  const [displayName, setDisplayName] = React.useState("");
  const [ProfilePicture, setProfilePicture] = React.useState("");

  React.useEffect(() => {
    var userInfo = {};
    const usersRef = firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid);

    usersRef.get().then((doc) => {
      if (!doc.exists) {
        console.log("No such document exists.");
      } else {
        userInfo = doc.data();
      }
      setDisplayName(userInfo.displayName);
      setProfilePicture(userInfo.photoURL);
      console.log(ProfilePicture);
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {ProfilePicture ? (
        <Image
          source={{
            uri: ProfilePicture,
          }}
          loadingStyle={{ width: 20, height: 10 }}
          style={{
            width: 200,
            height: 200,
            borderRadius: 100,
          }}
        />
      ) : (
        <Text>No picture yet.</Text>
      )}
      <Button
        title="Upload Profile picture"
        onPress={async () => {
          if (Constants.platform.ios) {
            let { status } = await ImagePicker.getCameraPermissionsAsync();
            if (status !== "granted") {
              status = await ImagePicker.requestCameraPermissionsAsync();
            }
            if (status !== "granted") {
              alert("GIVE US ACCESS TO THE CAMERA OR ELSE!");
            }
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.cancelled) {
              setProfilePicture(result.uri);
            }
          }
        }}
      />
      <View style={{ justifyContent: "center" }}>
        <TextInput
          style={{
            borderColor: "#000000",
            borderBottomWidth: 1,
            width: Dimensions.get("screen").width * 0.8,
            padding: 10,
          }}
          onChangeText={(x) => {
            setDisplayName(x);
          }}
        >
          {displayName}
        </TextInput>

        <Text>This is the name you'll be seen as in this app.</Text>
      </View>
      <TouchableHighlight
        style={{
          marginTop: 50,
          backgroundColor: "orange",
          width: "80%",
          height: 40,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 30,
        }}
        onPress={async () => {
          firebase.auth().currentUser.updateProfile({
            displayName: displayName,
            photoURL: ProfilePicture,
          });

          const response = await fetch(ProfilePicture);
          const blob = await response.blob();
          const imageSnapshot = await firebase
            .storage()
            .ref()
            .child("profilePictures")
            .child("toast.png")
            .put(blob);
          const photoURL = await imageSnapshot.ref.getDownloadURL();
          firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .set(
              {
                displayName: displayName,
                photoURL: photoURL,
              },
              { merge: true }
            );
          navigation.navigate("Home");
        }}
      >
        <Text>Save</Text>
      </TouchableHighlight>
    </View>
  );
}
