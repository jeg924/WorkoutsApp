import React, { useReducer } from "react";
import firebase from "firebase";
import "firebase/firestore";
import "firebase/auth";
import {
  View,
  Text,
  Switch,
  SafeAreaView,
  TouchableHighlight,
  Image,
} from "react-native";
import { TextInput, ScrollView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";

import Constants from "expo-constants";

export default function WorkoutInfoForm({ navigation, route }) {
  const { workoutID } = route.params;
  var published = false;
  async function loadWorkoutData() {
    setLoading(true);
    if (workoutID) {
      const workoutRef = firebase
        .firestore()
        .collection("workouts")
        .doc(workoutID);
      const workoutDoc = await workoutRef.get();
      const workout = workoutDoc.data();
      if (workout) {
        setWorkoutName(workout.workoutName);
        setWorkoutImage(workout.workoutImage);
        setWeightNeeded(workout.isWeightNeeded);
        setBarNeeded(workout.isBarNeeded);
        setChairNeeded(workout.isChairNeeded);
        setMatNeeded(workout.isMatNeeded);
        setTowelNeeded(workout.isTowelNeeded);

        setStrength(workout.isStrength);
        setCardio(workout.isCardio);
        setYoga(workout.isYoga);
        setSpeed(workout.isSpeed);
        setBalance(workout.isBalance);

        published = workout.published;
        Image.prefetch(workoutImage);
      }
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadWorkoutData();
  }, []);

  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [workoutName, setWorkoutName] = React.useState("");
  const [workoutImage, setWorkoutImage] = React.useState(null);

  const [isWeightNeeded, setWeightNeeded] = React.useState(false);
  const [isBarNeeded, setBarNeeded] = React.useState(false);
  const [isChairNeeded, setChairNeeded] = React.useState(false);
  const [isMatNeeded, setMatNeeded] = React.useState(false);
  const [isTowelNeeded, setTowelNeeded] = React.useState(false);

  const [isStrength, setStrength] = React.useState(false);
  const [isCardio, setCardio] = React.useState(false);
  const [isFlexibility, setFlexibility] = React.useState(false);

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
      value: isFlexibility,
      onChange: setFlexibility,
      description: "Flexibility",
    },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading</Text>
      </View>
    );
  }

  if (isSubmitting) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Submitting</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
            console.log("getting here but no further");
            navigation.navigate("My Workouts");
          }}
          style={{
            margin: 10,
            backgroundColor: "blue",
            borderRadius: "100%",
            padding: 5,
          }}
        >
          <Text>cancel</Text>
        </TouchableHighlight>
      </View>
      {workoutImage ? (
        <Image
          source={{ uri: workoutImage, cache: "force-cache" }}
          style={{ width: "100%", height: 200 }}
        />
      ) : null}
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
            backgroundColor: "blue",
            borderRadius: "100%",
            padding: 5,
          }}
        >
          <Text>Upload Cover Image</Text>
        </TouchableHighlight>
      </View>

      <Text style={{ marginLeft: 10 }}>Workout Name</Text>
      <TextInput
        style={{
          borderColor: "#000000",
          borderBottomWidth: 1,
          padding: 10,
          margin: 10,
        }}
        onChangeText={(x) => {
          setWorkoutName(x);
        }}
        defaultValue={workoutName}
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
            backgroundColor: "blue",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
            margin: 10,
          }}
          onPress={async () => {
            try {
              setIsSubmitting(true);
              let workoutRef = null;
              let published = false;
              if (workoutID) {
                workoutRef = firebase
                  .firestore()
                  .collection("workouts")
                  .doc(workoutID);
              } else {
                workoutRef = firebase.firestore().collection("workouts").doc();
              }
              // update firebase storage
              const response = await fetch(workoutImage);
              const blob = await response.blob();
              const imageSnapshot = await firebase
                .storage()
                .ref()
                .child("workoutImages")
                .child(workoutRef.id + ".png")
                .put(blob);

              const photoURL = await imageSnapshot.ref.getDownloadURL();

              const workoutData = {
                workoutID: workoutRef.id,
                authorID: firebase.auth().currentUser.uid,
                published: published,
                workoutName: workoutName,
                workoutImage: photoURL,
                isWeightNeeded: isWeightNeeded,
                isBarNeeded: isBarNeeded,
                isChairNeeded: isChairNeeded,
                isMatNeeded: isMatNeeded,
                isTowelNeeded: isTowelNeeded,
                isStrength: isStrength,
                isCardio: isCardio,
                isFlexibility: isFlexibility,
                lengthInMinutes: 0,
                deleted: false,
              };
              workoutRef.set(workoutData, { merge: true });

              navigation.navigate("Workout Editor", {
                workoutID: workoutData.workoutID,
              });
            } catch (error) {
              console.log("Error is", error);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <Text>Edit Exercises</Text>
        </TouchableHighlight>
      )}
    </View>
  );
}
