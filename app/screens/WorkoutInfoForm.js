import React, { useReducer } from "react";
import firebase from "firebase";
import "firebase/firestore";
import "firebase/auth";
import {
  View,
  Text,
  Button,
  Switch,
  FlatList,
  SafeAreaView,
  TouchableHighlight,
  ImageBackground,
} from "react-native";
import ImageLoad from "react-native-image-placeholder";
import { TextInput, ScrollView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { set } from "react-native-reanimated";

export default function WorkoutInfoForm({ navigation, route }) {
  const { workoutID } = route.params;

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [workoutName, setWorkoutName] = React.useState("");
  const [workoutImage, setWorkoutImage] = React.useState(null);

  const [isWeightNeeded, setWeightNeeded] = React.useState(false);
  const [isBarNeeded, setBarNeeded] = React.useState(false);
  const [isChairNeeded, setChairNeeded] = React.useState(false);
  const [isMatNeeded, setMatNeeded] = React.useState(false);
  const [isTowelNeeded, setTowelNeeded] = React.useState(false);

  const [isStrength, setStrength] = React.useState(false);
  const [isCardio, setCardio] = React.useState(false);
  const [isYoga, setYoga] = React.useState(false);
  const [isSpeed, setSpeed] = React.useState(false);
  const [isBalance, setBalance] = React.useState(false);

  const equipmentNeeded = [
    {
      value: isWeightNeeded,
      onChange: setWeightNeeded,
      description: "Weights or resistance bands",
    },
    {
      value: isBarNeeded,
      onChange: setBarNeeded,
      description: "Chin-Up Bar",
    },
    {
      value: isChairNeeded,
      onChange: setChairNeeded,
      description: "Bench or chair",
    },
    {
      value: isMatNeeded,
      onChange: setMatNeeded,
      description: "Mat",
    },
    {
      value: isTowelNeeded,
      onChange: setTowelNeeded,
      description: "Towel",
    },
  ];
  const category = [
    {
      value: isStrength,
      onChange: setStrength,
      description: "Strength",
    },
    {
      value: isCardio,
      onChange: setCardio,
      description: "Cardio",
    },
    {
      value: isYoga,
      onChange: setYoga,
      description: "Yoga",
    },
    {
      value: isBalance,
      onChange: setBalance,
      description: "Balance",
    },
    {
      value: isSpeed,
      onChange: setSpeed,
      description: "Speed",
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={{ uri: workoutImage ? workoutImage : "" }}
        loadingStyle={{ width: 20, height: 10 }}
        style={{ width: "100%", height: 200 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 100,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", margin: 10 }}>
            Create a workout
          </Text>
          <TouchableHighlight
            onPress={() => {
              navigation.goBack();
            }}
            style={{
              margin: 10,
              backgroundColor: "orange",
              borderRadius: "100%",
              padding: 5,
            }}
          >
            <Text>cancel</Text>
          </TouchableHighlight>
        </View>
        <View
          style={{
            padding: 10,
            width: 165,
          }}
        >
          <TouchableHighlight
            onPress={async () => {
              if (Constants.platform.ios) {
                let { status } = await ImagePicker.getCameraPermissionsAsync();
                if (status !== "granted") {
                  status = await ImagePicker.requestCameraPermissionsAsync();
                }
                if (status !== "granted") {
                  alert(
                    "Sorry, we need camera roll permissions to make this work!"
                  );
                }
                let result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 1,
                });

                console.log(result.uri);

                if (!result.cancelled) {
                  setWorkoutImage(result.uri);
                }
              }
            }}
            style={{
              backgroundColor: "orange",
              borderRadius: "100%",
              padding: 5,
            }}
          >
            <Text>Upload Cover Image</Text>
          </TouchableHighlight>
        </View>
      </ImageBackground>

      <Text style={{ marginLeft: 10 }}>Workout Name</Text>
      <TextInput
        style={{
          borderColor: "#000000",
          borderBottomWidth: 1,
          padding: 10,
          margin: 10,
        }}
        onChangeText={(x) => setWorkoutName(x)}
      ></TextInput>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView bounces style={{ flex: 1 }}>
          <Text>Equipment Needed</Text>
          {equipmentNeeded.map((item) => {
            return (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                }}
              >
                <Switch
                  value={item.value}
                  onValueChange={item.onChange}
                  style={{ alignSelf: "center" }}
                />
                <Text style={{ margin: 10 }}>{item.description}</Text>
              </View>
            );
          })}
          <Text>Category</Text>
          {category.map((item) => {
            return (
              <View style={{ flexDirection: "row" }}>
                <Switch
                  value={item.value}
                  onValueChange={item.onChange}
                  style={{ alignSelf: "center" }}
                />
                <Text style={{ margin: 10 }}>{item.description}</Text>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
      {isSubmitting ? (
        <Text>Submitting</Text>
      ) : (
        <TouchableHighlight
          style={{
            borderRadius: "100%",
            backgroundColor: "orange",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
            margin: 10,
          }}
          onPress={async () => {
            // firebase stuff. Need to store info. Create a unique ID.
            // in order to do this I need to have a submitting case. and a try catch
            try {
              setIsSubmitting(true);
              let workoutRef = null;

              if (workoutID) {
                workoutRef = firebase
                  .firestore()
                  .collection("workouts")
                  .doc(workoutID);
              } else {
                workoutRef = firebase.firestore().collection("workouts").doc();
              }

              const workoutData = {
                workoutID: workoutRef.id,
                authorID: firebase.auth().currentUser.uid,
                published: false,
                workoutName: workoutName,
                workoutImage: workoutImage,
                isWeightNeeded: isWeightNeeded,
                isBarNeeded: isBarNeeded,
                isChairNeeded: isChairNeeded,
                isMatNeeded: isMatNeeded,
                isTowelNeeded: isTowelNeeded,
                isStrength: isStrength,
                isCardio: isCardio,
                isYoga: isYoga,
                isBalance: isBalance,
                isSpeed: isSpeed,
                lengthInMinutes: 0,
              };

              workoutRef.set(workoutData);

              navigation.navigate("Workout Editor", {
                workoutID: workoutData.workoutID,
              });
            } catch (error) {
              setError(error);
              console.log("Error is", error);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <Text>Save Workout</Text>
        </TouchableHighlight>
      )}
    </View>
  );
}
