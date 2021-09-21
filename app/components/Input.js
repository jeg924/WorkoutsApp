import React from "react";
import { View, TextInput, Text } from "react-native";
import { useTheme } from "@react-navigation/native";

export default function Input({
  description,
  defaultValue,
  onChangeText,
  maxLength,
  keyboardType,
  enablesReturnKeyAutomatically,
  autoFocus,
  secureTextEntry,
  placeholder,
  textContentType,
  autoCompleteType,
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: "bold", color: colors.text }}>
        {description}
      </Text>
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
        autoFocus={autoFocus}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        textContentType={textContentType}
        autoCompleteType={autoCompleteType}
      ></TextInput>
    </View>
  );
}
