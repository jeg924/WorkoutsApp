import React from "react";
import firebase from "firebase";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, Button } from "react-native";

export default function ModalFriendPicker({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 30 }}>This is a modal!</Text>
      <Button onPress={() => navigation.goBack()} title="Dismiss" />
    </View>
  );
}
