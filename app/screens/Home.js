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
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <Header tabScreen={"true"} title="Home" />

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
