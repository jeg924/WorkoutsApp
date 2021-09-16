import React from "react";
import { View, TextInput, Text } from "react-native";

export default function Input({
  description,
  defaultValue,
  onChangeText,
  maxLength,
  keyboardType,
  enablesReturnKeyAutomatically,
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: "bold" }}>{description}</Text>
      <TextInput
        style={{
          borderRadius: 10,
          borderWidth: 1,
          padding: 10,
          width: "100%",
        }}
        onChangeText={onChangeText}
        defaultValue={defaultValue}
        maxLength={maxLength}
        keyboardType={keyboardType}
        enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
      ></TextInput>
    </View>
  );
}