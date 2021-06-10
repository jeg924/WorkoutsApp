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
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// TODO: look into saving profile pics in Firebase storage
// TODO: create a view that says saving friend. And then show them as a friend.

export default function Profile({ navigation, route }) {
  const { userID } = route.params;
  const [displayName, setDisplayName] = React.useState("");
  const [profilePicture, setProfilePicture] = React.useState("");

  React.useEffect(() => {
    var userInfo = {};
    const usersRef = firebase.firestore().collection("users").doc(userID);

    usersRef.get().then((doc) => {
      if (!doc.exists) {
        console.log("No such document exists.");
      } else {
        userInfo = doc.data();
      }
      setDisplayName(userInfo.displayName);
      setProfilePicture(userInfo.photoURL);
      console.log(profilePicture);
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 30 }}>{displayName}</Text>
      {profilePicture ? (
        <Image
          source={{
            uri: profilePicture,
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
      <View>
        {userID === firebase.auth().currentUser.uid ? (
          <View style={{}}>
            <TouchableHighlight
              onPress={() => {
                navigation.navigate("Edit Profile");
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Edit Profile</Text>
            </TouchableHighlight>
          </View>
        ) : (
          <View style={{}}>
            <TouchableHighlight
              onPress={async () => {
                var userInfo = {};
                const userRef = firebase
                  .firestore()
                  .collection("users")
                  .doc(firebase.auth().currentUser.uid);

                await userRef.get().then((doc) => {
                  if (!doc.exists) {
                    console.log("No such document exists.");
                  } else {
                    userInfo = doc.data();
                    if (userInfo.friends) {
                      let friends = [...userInfo.friends];
                      if (!friends.includes(userID)) {
                        friends = friends.concat(userID);
                        userRef.update({
                          friends: friends,
                        });
                      }
                    } else {
                      userRef.update({
                        friends: [{ userID, displayName, profilePicture }],
                      });
                    }
                  }
                });
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Feather name="heart" color="orange" size={30} />
                <Text
                  style={{ fontWeight: "bold", marginTop: 5, marginLeft: 10 }}
                >
                  Add Friend
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        )}
      </View>
    </View>
  );
}
