import React from "react";
import { TouchableHighlight, Text } from "react-native";

export default function SolidButton({ title, onPress, ...rest }) {
  return (
    <TouchableHighlight
      style={{
        backgroundColor: "blue",
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
