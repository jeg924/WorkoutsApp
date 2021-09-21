import React from "react";
import firebase from "firebase";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, Button } from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../components/Header";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";

const Stack = createStackNavigator();

export default function Home({ navigation }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <Header tabScreen={"true"} title="Home" />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <SolidButton
          onPress={() => firebase.auth().signOut()}
          title="Sign Out"
        />
        <SecondaryButton
          onPress={() =>
            navigation.navigate("Profile", {
              userID: firebase.auth().currentUser.uid,
            })
          }
          title="My profile"
        />
      </View>
    </View>
  );
}
