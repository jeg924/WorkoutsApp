import React from "react";
import firebase, { firestore } from "firebase";
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
const uuidv4 = require("uuid/v4");

export default function EditProfile({ navigation, route }) {
  const [loading, setLoading] = React.useState(true);
  const [displayName, setDisplayName] = React.useState("");
  const [profilePicture, setProfilePicture] = React.useState("");
  const [displayNameChanged, setDisplayNameChanged] = React.useState(false);
  const [profilePictureChanged, setProfilePictureChanged] =
    React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    loadMyData();
  }, []);

  async function loadMyData() {
    setLoading(true);
    const myRef = firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid);
    const myDoc = await myRef.get();
    const my = myDoc.data();
    if (my?.displayName) {
      setDisplayName(my.displayName);
    }
    if (my?.photoURL) {
      setProfilePicture(my.photoURL);
      await Image.prefetch(my.photoURL);
    }
    setLoading(false);
  }

  if (loading) {
    // all users will have a display name from when they sign up.
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading</Text>
      </View>
    );
  }

  if (saving) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Saving</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {profilePicture ? (
        <Image
          source={{
            uri: profilePicture,
            cache: "force-cache",
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
              alert("we need camera permissions for this to work.");
            }
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.cancelled) {
              setProfilePicture(result.uri);
              setProfilePictureChanged(true);
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
            setDisplayNameChanged(true);
          }}
        >
          {displayName}
        </TextInput>

        <Text>This is the name you'll be seen as in this app.</Text>
      </View>

      {profilePictureChanged || displayNameChanged ? (
        <TouchableHighlight
          style={{
            marginTop: 50,
            backgroundColor: "blue",
            width: "80%",
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 30,
          }}
          onPress={async () => {
            setSaving(true);
            try {
              if (profilePictureChanged && displayNameChanged) {
                // update storage
                const response = await fetch(profilePicture);
                const blob = await response.blob();
                const imageSnapshot = await firebase
                  .storage()
                  .ref()
                  .child("profile pictures")
                  .child(uuidv4() + ".png")
                  .put(blob);
                // update firestore
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
                console.log(profilePicture);
                setDisplayNameChanged(false);
                setProfilePictureChanged(false);
                setSaving(false);
                navigation.goBack();
              }
              if (profilePictureChanged) {
                // update storage
                const response = await fetch(profilePicture);
                const blob = await response.blob();
                console.log(uuidv4() + ".png");
                const imageSnapshot = await firebase
                  .storage()
                  .ref()
                  .child("profile pictures")
                  .child(uuidv4() + ".png")
                  .put(blob);
                // update firestore
                const photoURL = await imageSnapshot.ref.getDownloadURL();
                firebase
                  .firestore()
                  .collection("users")
                  .doc(firebase.auth().currentUser.uid)
                  .set(
                    {
                      photoURL: photoURL,
                    },
                    { merge: true }
                  );
                setDisplayNameChanged(false);
                setProfilePictureChanged(false);
                setSaving(false);
                navigation.goBack();
              }
              if (displayNameChanged) {
                // update firestore
                firebase
                  .firestore()
                  .collection("users")
                  .doc(firebase.auth().currentUser.uid)
                  .set(
                    {
                      displayName: displayName,
                    },
                    { merge: true }
                  );
                setDisplayNameChanged(false);
                setProfilePictureChanged(false);
                setSaving(false);
                navigation.goBack();
              }
            } catch (error) {
              console.log("Error is " + error);
            }
          }}
        >
          <Text>Save</Text>
        </TouchableHighlight>
      ) : (
        <View></View>
      )}
    </View>
  );
}
