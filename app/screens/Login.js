import React from "react";
import {
  View,
  TextInput,
  Text,
  TouchableHighlight,
  Dimensions,
} from "react-native";
import firebase from "firebase";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import Input from "../components/Input";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

// Login should handle firestore data.
// if signing up, it adds a user doc to the the collection
// if signing in, the data should already be there.
//
export default function Login() {
  const [returningUser, setReturningUser] = React.useState(true);
  const [tabIndex, setTabIndex] = React.useState(0);
  var [name, setName] = React.useState("");
  var [email, setEmail] = React.useState("");
  var [password, setPassword] = React.useState("");
  var [error, setError] = React.useState("");

  function signup() {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        firebase.firestore().collection("users").doc(result.user.uid).set({
          displayName: name,
          deleted: false,
        });
      })
      .catch((error) => setError(error.message));
  }

  function signin() {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((error) => setError(error.message));
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 0.8 }}></View>
      <View style={{ flex: 2, flexDirection: "row" }}>
        <View style={{ flex: 1 }}></View>
        <View style={{ flex: 8 }}>
          <View style={{ flex: 0.3, alignItems: "center" }}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 30,
              }}
            >
              Workouts App
            </Text>
          </View>
          <SegmentedControl
            values={["Sign in", "Sign up"]}
            selectedIndex={tabIndex}
            onChange={(event) => {
              setTabIndex(event.nativeEvent.selectedSegmentIndex);
              setError("");
            }}
            tintColor={colors.notification}
            fontStyle={{ color: "black" }}
            activeFontStyle={{ color: "white" }}
            style={{ height: 50 }}
          />
          {tabIndex === 0 ? (
            <View
              style={{
                flex: 1,
              }}
            >
              <View style={{ flex: 0.5 }}></View>
              <Input
                description="Email"
                placeholder="Email Address"
                textContentType="emailAddress"
                keyboardType="email-address"
                autoCompleteType="email"
                onChangeText={(email) => setEmail(email)}
              />
              <Input
                description="Password"
                autoFocus={false}
                secureTextEntry={true}
                placeholder="Password"
                textContentType="password"
                autoCompleteType="password"
                onChangeText={(password) => setPassword(password)}
              />

              <View style={{ flex: 1 }}></View>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
              }}
            >
              <View style={{ flex: 0.5 }}></View>
              <Input
                description="Email"
                autoFocus={false}
                placeholder="Email Address"
                textContentType="emailAddress"
                keyboardType="email-address"
                autoCompleteType="email"
                onChangeText={(email) => setEmail(email)}
              />
              <Input
                description="Display Name"
                autoFocus={false}
                placeholder="Display Name"
                textContentType="name"
                onChangeText={(name) => setName(name)}
              />
              <Input
                description="Password"
                autoFocus={false}
                secureTextEntry={true}
                placeholder="Password"
                textContentType="password"
                autoCompleteType="password"
                onChangeText={(password) => setPassword(password)}
              />
              <View style={{ flex: 0.5 }}></View>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}></View>
      </View>
      <View style={{ flex: 1, alignItems: "center" }}>
        <SolidButton
          title={tabIndex === 0 ? "Login" : "Register"}
          onPress={tabIndex === 0 ? signin : signup}
          style={{ backgroundColor: "#BB86FC" }}
        />
        <View
          style={{
            width: "90%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      </View>
    </View>
  );
}
