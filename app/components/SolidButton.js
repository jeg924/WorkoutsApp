import React from "react";
import { TouchableHighlight, Text } from "react-native";
import { useTheme } from "@react-navigation/native";

export default function SolidButton({ title, onPress, ...rest }) {
  const { colors } = useTheme();
  return (
    <TouchableHighlight
      style={{
        backgroundColor: colors.notification,
        borderRadius: 20,
        width: "90%",
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
      }}
      onPress={onPress}
      rest
    >
      <Text style={{ color: "white" }}>{title}</Text>
    </TouchableHighlight>
  );
}
