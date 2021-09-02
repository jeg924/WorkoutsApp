import React from "react";
import { TouchableHighlight, Text } from "react-native";

export default function SecondaryButton({ title, onPress, ...rest }) {
  return (
    <TouchableHighlight
      style={{
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "blue",
        borderRadius: 20,
        width: "90%",
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
      }}
      onPress={onPress}
      rest
    >
      <Text style={{ color: "blue" }}>{title}</Text>
    </TouchableHighlight>
  );
}
