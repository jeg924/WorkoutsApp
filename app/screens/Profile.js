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
import { set } from "react-native-reanimated";
import { GlobalContext } from "../App";

export default function Profile({ navigation, route }) {
  // const { myUserId, myFriends } = React.useContext(GlobalContext);

  const { userID, edited } = route.params;
  const [loading, setLoading] = React.useState(true);
  const [displayName, setDisplayName] = React.useState("");
  const [profilePicture, setProfilePicture] = React.useState("");
  const [addingFriend, setAddingFriend] = React.useState(false);
  const [isFriend, setIsFriend] = React.useState(false);

  async function loadUserData() {
    setLoading(true);
    // set displayName and profile picture
    const userRef = firebase.firestore().collection("users").doc(userID);
    const userDoc = await userRef.get();
    const user = userDoc.data();
    if (user) {
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

      if (my?.friends?.includes(userID)) {
        setIsFriend(true);
      }
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadUserData();
  }, [userID]);

  React.useEffect(() => {
    loadUserData();
  }, [edited]);

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
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 30 }}>{displayName}</Text>
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
      <View>
        {userID === firebase.auth().currentUser.uid ? ( // is this my own profile?
          <View style={{}}>
            <TouchableHighlight
              onPress={() => {
                navigation.navigate("Edit Profile", { edited: edited });
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Edit Profile</Text>
            </TouchableHighlight>
          </View>
        ) : !isFriend ? ( // is this my Friend?
          addingFriend ? ( // am I currently adding this person to my friends list?
            <Text>Adding Friend...</Text>
          ) : (
            <View style={{}}>
              <TouchableHighlight
                onPress={async () => {
                  setAddingFriend(true);
                  const myRef = firebase
                    .firestore()
                    .collection("users")
                    .doc(firebase.auth().currentUser.uid);

                  const myDoc = await myRef.get();
                  const my = myDoc.data();

                  if (my) {
                    let friends = [];
                    if (my.friends) {
                      friends = [...my.friends];
                      friends.concat({
                        userID: userID,
                        displayName: displayName,
                        profilePicture: profilePicture,
                      });
                    } else {
                      friends = [
                        {
                          userID: userID,
                          displayName: displayName,
                          profilePicture: profilePicture,
                        },
                      ];
                    }

                    myRef.set({ friends: friends }, { merge: true });
                  }

                  setIsFriend(true);
                  setAddingFriend(false);
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
          )
        ) : (
          // already my friend
          <Text>Friend</Text>
        )}
      </View>
    </View>
  );
}
