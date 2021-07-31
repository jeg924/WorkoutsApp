import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Dimensions,
} from "react-native";
import firebase from "firebase";
import { Video } from "expo-av";

// todo: allow minimizing the screen while watching in order to edit data.

export default function WorkoutVideoScreen({ navigation, route }) {
  const { recordID, workout, currentExercise, exercises } = route.params;
  const user = firebase.auth().currentUser.uid;
  const [amountOfWeight, setAmountOfWeight] = React.useState(null);
  const [numberOfReps, setNumberOfReps] = React.useState(null);
  const [amountOfTime, setAmountOfTime] = React.useState(null);

  if (exercises.length == 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          margin: 20,
        }}
      >
        <Text>This workout has no exercises.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View>
        <View>
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            {workout.workoutName}
          </Text>
        </View>
        {exercises[currentExercise].video ? (
          <Video
            shouldPlay
            initialStatus={{ resizeMode: "stretch" }}
            style={{
              width: "100%",
              height: "40%",
            }}
            useNativeControls
            resizeMode="contain"
            source={{ uri: exercises[currentExercise].video }}
            onPlaybackStatusUpdate={(playbackStatus) => {}}
          />
        ) : (
          <View></View>
        )}
        <View>
          <Text style={{ fontWeight: "bold" }}>
            {exercises[currentExercise].name}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
          }}
        >
          {exercises[currentExercise].reps ? (
            <View style={{ padding: 10 }}>
              <Text>Reps</Text>
              <TextInput
                style={{
                  borderRadius: 10,
                  borderColor: "#000000",
                  borderWidth: 1,
                  padding: 10,
                  width:
                    !exercises[currentExercise].weight &&
                    !exercises[currentExercise].time
                      ? Dimensions.get("screen").width * 0.8
                      : (exercises[currentExercise].weight &&
                          !exercises[currentExercise].time) ||
                        (!exercises[currentExercise].weight &&
                          exercises[currentExercise].time)
                      ? Dimensions.get("screen").width * 0.45
                      : Dimensions.get("screen").width * 0.275,
                }}
                keyboardType="number-pad"
                onChangeText={(x) => setNumberOfReps(x)}
              />
            </View>
          ) : null}
          {exercises[currentExercise].weight ? (
            <View style={{ padding: 10 }}>
              <Text>Weight</Text>
              <TextInput
                style={{
                  borderRadius: 10,
                  borderColor: "#000000",
                  borderWidth: 1,
                  padding: 10,
                  width:
                    !exercises[currentExercise].reps &&
                    !exercises[currentExercise].time
                      ? Dimensions.get("screen").width * 0.8
                      : (exercises[currentExercise].reps &&
                          !exercises[currentExercise].time) ||
                        (!exercises[currentExercise].reps &&
                          exercises[currentExercise].time)
                      ? Dimensions.get("screen").width * 0.45
                      : Dimensions.get("screen").width * 0.275,
                }}
                keyboardType="number-pad"
                onChangeText={(x) => setAmountOfWeight(x)}
              />
            </View>
          ) : null}
          {exercises[currentExercise].time ? (
            <View style={{ padding: 10 }}>
              <Text>Time</Text>
              <TextInput
                style={{
                  borderRadius: 10,
                  borderColor: "#000000",
                  borderWidth: 1,
                  padding: 10,
                  width:
                    !exercises[currentExercise].reps &&
                    !exercises[currentExercise].time
                      ? Dimensions.get("screen").width * 0.8
                      : (exercises[currentExercise].reps &&
                          !exercises[currentExercise].time) ||
                        (!exercises[currentExercise].reps &&
                          exercises[currentExercise].time)
                      ? Dimensions.get("screen").width * 0.45
                      : Dimensions.get("screen").width * 0.275,
                }}
                keyboardType="number-pad"
                onChangeText={(x) => setAmountOfTime(x)}
              />
            </View>
          ) : null}
        </View>
        <TouchableHighlight
          onPress={async () => {
            const recordedWorkoutRef = firebase
              .firestore()
              .collection("users")
              .doc(user)
              .collection("recorded workouts")
              .doc(recordID);

            const recordedWorkoutDoc = await recordedWorkoutRef.get();
            const recordedWorkout = recordedWorkoutDoc.data();
            if (recordedWorkout) {
              var exerciseInputObject = {};
              exerciseInputObject.name = exercises[currentExercise].name;
              exerciseInputObject.reps = numberOfReps;
              exerciseInputObject.weight = amountOfWeight;
              exerciseInputObject.time = amountOfTime;

              if (recordedWorkout.exerciseInputData) {
                let exerciseInputData = [...recordedWorkout.exerciseInputData];
                exerciseInputData =
                  exerciseInputData.concat(exerciseInputObject);
                recordedWorkoutRef.set(
                  {
                    exerciseInputData: exerciseInputData,
                  },
                  { merge: true }
                );
              } else {
                recordedWorkoutRef.set(
                  {
                    exerciseInputData: [exerciseInputObject],
                  },
                  { merge: true }
                );
              }
            }
            // update current exercise
            navigation.navigate("Start Workout", {
              current: currentExercise + 1,
            });
          }}
        >
          <View
            style={{
              backgroundColor: "orange",
              borderRadius: "15%",
              height: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Continue</Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
}
