import React from "react";
import { Text, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";

export default function Header({
  title,
  navigation,
  route,
  tabScreen,
  headerButton,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View
      style={{
        paddingTop: insets.top,
        flexDirection: "row",
        backgroundColor: colors.card,
        height: 70,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
            <Feather name="chevron-left" size={30} color="white" />
          </Pressable>
        )}
      </View>
      <View style={{ flex: 4, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 30, fontWeight: "bold", color: "white" }}>
          {title}
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {tabScreen ? headerButton : null}
      </View>
    </View>
  );
}
