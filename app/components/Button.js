import React from "react";
import { TouchableHighlight, Text } from "react-native";

export default function MyButton({ title, onPress, ...rest }) {
  return (
    <TouchableHighlight
      style={{
        backgroundColor: "orange",
        borderRadius: "100%",
        width: "100%",
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
