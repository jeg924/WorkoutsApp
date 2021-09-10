import React from "react";
import firebase, { firestore } from "firebase";
import {
  View,
  Text,
  Button,
  Image,
  Dimensions,
  TouchableHighlight,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
const uuidv4 = require("uuid/v4");
import Header from "../components/Header";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import Input from "../components/Input";
import { DisplayTime } from "../UtilityFunctions";

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

  async function save() {
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
        backgroundColor: "white",
      }}
    >
      <Header title="Edit Profile" navigation={navigation} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
        <View
          style={{
            flex: 5,

            justifyContent: "flex-end",
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
        </View>
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <SecondaryButton
            title={
              profilePicture ? "Edit Profile Picture" : "Upload Profile picture"
            }
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
        </View>
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 3, flexDirection: "row" }}
        >
          <View style={{ flex: 1 }}></View>
          <View
            style={{
              flex: 18,
              justifyContent: "center",
            }}
          >
            <Input
              onChangeText={(x) => {
                setDisplayName(x);
                setDisplayNameChanged(true);
              }}
              description="Display Name"
              defaultValue={displayName}
            />
          </View>
          <View style={{ flex: 1 }}></View>
        </KeyboardAvoidingView>
      </ScrollView>
      <View style={{ alignItems: "center" }}>
        <SolidButton onPress={save} title="Save" />
      </View>
    </View>
  );
}
