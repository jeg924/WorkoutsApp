import React from "react";
import firebase from "firebase";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, Button } from "react-native";

const Stack = createStackNavigator();

export default function Home({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home</Text>
      <Button onPress={() => firebase.auth().signOut()} title="Sign Out" />
      <Button
        onPress={() =>
          navigation.navigate("Profile", {
            userID: firebase.auth().currentUser.uid,
          })
        }
        title="My profile"
      ></Button>
    </View>
  );
}
