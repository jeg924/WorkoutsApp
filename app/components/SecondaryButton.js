import React from "react";
import { TouchableHighlight, Text } from "react-native";
import { useTheme } from "@react-navigation/native";

export default function SecondaryButton({ title, onPress, ...rest }) {
  const { colors } = useTheme();
  return (
    <TouchableHighlight
      style={{
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        width: "90%",
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
      }}
      onPress={onPress}
      rest
    >
      <Text style={{ color: colors.border }}>{title}</Text>
    </TouchableHighlight>
  );
}
