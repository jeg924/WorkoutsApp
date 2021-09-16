import React from "react";
import { Text, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header({ title, navigation, route, tabScreen }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        flexDirection: "row",
        backgroundColor: "white",
        height: 70,
        borderBottomWidth: 1,
        borderBottomColor: "black",
      }}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {tabScreen ? null : (
          <Pressable
            onPress={() => {
              if (!route) navigation.goBack();
              else {
                navigation.navigate(route.screen, route.params);
              }
            }}
          >
            <Feather name="chevron-left" size={30} />
          </Pressable>
        )}
      </View>
      <View style={{ flex: 4, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}></View>
    </View>
  );
}
