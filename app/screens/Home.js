import React from "react";
import firebase from "firebase";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "../components/Header";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle, Line } from "react-native-svg";
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
      <Header
        tabScreen={"true"}
        title="Home"
        headerButton={
          <Pressable
            onPress={() => {
              navigation.navigate("Profile", {
                userID: firebase.auth().currentUser.uid,
              });
            }}
          >
            <Feather name="user" size={30} color="white" />
          </Pressable>
        }
      />

      <ScrollView>
        <View style={{ height: 50 }}></View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 18 }}>
            <View style={{ height: 200 }}>
              <View>
                <Text
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  Continue where you left off
                </Text>
              </View>
              <View style={{ paddingTop: 5, paddingBottom: 5 }}>
                <Svg height={1} width="100%">
                  <Line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="0"
                    stroke="black"
                    strokeWidth="2"
                  />
                </Svg>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}></View>
      </ScrollView>
    </View>
  );
}
