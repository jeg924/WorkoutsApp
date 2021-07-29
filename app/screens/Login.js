import React from "react";
import {
  View,
  TextInput,
  Text,
  TouchableHighlight,
  Dimensions,
} from "react-native";
import firebase from "firebase";

// Login should handle firestore data.
// if signing up, it adds a user doc to the the collection
// if signing in, the data should already be there.
//
export default function Login() {
  const [returningUser, setReturningUser] = React.useState(true);
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
    console.log("testing");
  }

  function signin() {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((error) => setError(error.message));
  }

  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: "#484848" }}>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 30,
          marginTop: 100,
          marginBottom: 20,
          color: "white",
        }}
      >
        Workouts App
      </Text>
      <View
        style={{
          flexDirection: "row",
          padding: 10,
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <View
          style={{
            marginRight: 10,
            borderBottomWidth: returningUser ? 2 : 0,
            borderBottomColor: "orange",
          }}
        >
          <TouchableHighlight
            onPress={() => {
              setReturningUser(true);
            }}
          >
            <Text style={{ color: "white" }}>SIGN IN</Text>
          </TouchableHighlight>
        </View>
        <View
          style={{
            marginLeft: 10,
            borderBottomWidth: !returningUser ? 2 : 0,
            borderBottomColor: "orange",
          }}
        >
          <TouchableHighlight
            onPress={() => {
              setReturningUser(false);
            }}
          >
            <Text style={{ color: "white" }}>SIGN UP</Text>
          </TouchableHighlight>
        </View>
      </View>
      {returningUser ? (
        <View style={{ flex: 1 }}>
          <TextInput
            style={{
              backgroundColor: "white",
              borderRadius: "100%",
              borderColor: "#000000",
              borderWidth: 1,
              padding: 15,
              marginBottom: 20,
              width: Dimensions.get("screen").width * 0.7,
            }}
            placeholder="Email Address"
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCompleteType="email"
            onChangeText={(email) => setEmail(email)}
          />
          <TextInput
            style={{
              backgroundColor: "white",
              borderRadius: "100%",
              borderColor: "#000000",
              borderWidth: 1,
              padding: 15,
              marginBottom: 20,
              width: Dimensions.get("screen").width * 0.7,
            }}
            autoFocus={false}
            secureTextEntry={true}
            placeholder="Password"
            textContentType="password"
            autoCompleteType="password"
            onChangeText={(password) => setPassword(password)}
          />
          <View style={{ marginTop: 30 }}>
            <TouchableHighlight
              onPress={signin}
              style={{
                backgroundColor: "orange",
                borderRadius: "100%",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                padding: 15,
              }}
            >
              <Text style={{ fontWeight: "bold", color: "white" }}>
                Sign In
              </Text>
            </TouchableHighlight>

            <Text style={{ color: "white" }}>{error}</Text>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View>
            <TextInput
              style={{
                backgroundColor: "white",
                borderRadius: "100%",
                borderColor: "#000000",
                borderWidth: 1,
                padding: 15,
                marginBottom: 20,
                width: Dimensions.get("screen").width * 0.7,
              }}
              autoFocus={false}
              placeholder="Display Name"
              textContentType="name"
              onChangeText={(name) => setName(name)}
            />

            <TextInput
              style={{
                backgroundColor: "white",
                borderRadius: "100%",
                borderColor: "#000000",
                borderWidth: 1,
                padding: 15,
                marginBottom: 20,
                width: Dimensions.get("screen").width * 0.7,
              }}
              autoFocus={false}
              secureTextEntry={true}
              placeholder="Password"
              textContentType="password"
              autoCompleteType="password"
              onChangeText={(password) => setPassword(password)}
            />
            <TextInput
              style={{
                backgroundColor: "white",
                borderRadius: "100%",
                borderColor: "#000000",
                borderWidth: 1,
                padding: 15,
                marginBottom: 20,
                width: Dimensions.get("screen").width * 0.7,
              }}
              autoFocus={false}
              placeholder="Email Address"
              textContentType="emailAddress"
              keyboardType="email-address"
              autoCompleteType="email"
              onChangeText={(email) => setEmail(email)}
            />
          </View>
          <View style={{ marginTop: 20 }}>
            <TouchableHighlight
              onPress={signup}
              style={{
                backgroundColor: "orange",
                borderRadius: "100%",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
                padding: 15,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Sign Up</Text>
            </TouchableHighlight>
          </View>
          <Text style={{ color: "white" }}>{error}</Text>
        </View>
      )}
    </View>
  );
}
