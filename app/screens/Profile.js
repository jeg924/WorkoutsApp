import React from "react";
import firebase from "firebase";
import { View, Text, Image, TouchableHighlight } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { set } from "react-native-reanimated";
import { GlobalContext } from "../App";
import Header from "../components/Header";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";

export default function Profile({ navigation, route }) {
  // const { myUserId, myFriends } = React.useContext(GlobalContext);

  const { userID } = route.params;
  const [loading, setLoading] = React.useState(true);
  const [displayName, setDisplayName] = React.useState("");
  const [profilePicture, setProfilePicture] = React.useState("");
  const [addingFriend, setAddingFriend] = React.useState(false);
  const [removingFriend, setRemovingFriend] = React.useState(false);
  const [isFriend, setIsFriend] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  async function loadUserData() {
    setLoading(true);
    // set displayName and profile picture
    const userRef = firebase.firestore().collection("users").doc(userID);
    const userDoc = await userRef.get();
    const user = userDoc.data();
    if (user) {
      console.log(user);
      setDisplayName(user.displayName);
      if (user.photoURL) {
        await Image.prefetch(user.photoURL);
        setProfilePicture(user.photoURL);
      }
    }
    if (userID != firebase.auth().currentUser.uid) {
      // set is friend to true if this user in my friends list
      const myRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid);
      const myDoc = await myRef.get();
      const my = myDoc.data();
      console.log(userID);
      console.log(my.friends);
      if (my?.friends?.some((friend) => friend.userID === userID)) {
        setIsFriend(true);
      }
    }
    setLoading(false);
  }

  async function addFriend() {
    try {
      setAddingFriend(true);
      const myRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid);

      const myDoc = await myRef.get();
      const my = myDoc.data();

      var friends = [];
      if (my.friends) {
        friends = [...my.friends];
      }
      friends.push({
        userID: userID,
        displayName: displayName,
        profilePicture: profilePicture,
      });
      console.log("FRIENDS ++++++++");
      console.log(friends);
      await myRef.set({ friends: friends }, { merge: true });

      setIsFriend(true);
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setAddingFriend(false);
    }
  }

  async function removeFriend() {
    try {
      setRemovingFriend(true);
      const myRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid);

      const myDoc = await myRef.get();
      const my = myDoc.data();
      let friends = [...my.friends];
      friends = friends.filter((friend) => friend.userID !== userID);
      myRef.set({ friends: friends }, { merge: true });
      setIsFriend(false);
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setRemovingFriend(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
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
      <Header navigation={navigation} title="Profile" />
      <View
        style={{
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 30 }}>
            {displayName}
          </Text>
        </View>
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
          style={{
            flex: 1,
          }}
        >
          <View style={{ flex: 1 }}>
            {userID === firebase.auth().currentUser.uid ? ( // is this my own profile?
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <SolidButton
                  onPress={() => {
                    navigation.navigate("Edit Profile");
                  }}
                  title="Edit Profile"
                />
                <View style={{ height: 10 }}></View>
                <SecondaryButton
                  title="Sign out"
                  onPress={() => firebase.auth().signOut()}
                />
              </View>
            ) : !isFriend ? ( // is this my Friend?
              addingFriend ? ( // am I currently adding this person to my friends list?
                <Text>Adding Friend...</Text>
              ) : (
                <View style={{}}>
                  <SolidButton onPress={addFriend} title="Add Friend" />
                </View>
              )
            ) : removingFriend ? (
              <Text>Removing friend...</Text>
            ) : (
              // already my friend
              <View style={{}}>
                <SecondaryButton onPress={removeFriend} title="Remove Friend" />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
