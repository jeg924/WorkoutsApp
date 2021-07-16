import { TextInput as RNTextInput } from "react-native";

// import as
// rename mine (TextField)
export default function MyTextInput({ style, ...rest }) {
  return (
    <RNTextInput
      {...rest}
      style={{
        backgroundColor: "white",
        borderRadius: "100%",
        borderColor: "#000000",
        borderWidth: 1,
        padding: 15,
        ...style,
      }}
    />
  );
}
