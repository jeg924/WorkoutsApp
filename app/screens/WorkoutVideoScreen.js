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

export default function WorkoutVideoScreen({ navigation, route }) {
  const { recordID, workoutData, currentExercise, exercises } = route.params;
  const user = firebase.auth().currentUser.uid;

  const [isVideoFinished, setIsVideoFinished] = React.useState(false);
  const [numberOfReps, setNumberOfReps] = React.useState(0);
  const [amountOfWeight, setAmountOfWeight] = React.useState(0);
  const [amountOfTime, setAmountOfTime] = React.useState(0);

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
        <Text>
          No exercises. Whoever created this workout was dumb as a rock.
        </Text>
      </View>
    );
  }

  if (isVideoFinished) {
    return (
      <View style={{ flex: 1 }}>
        <View>
          <View>
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>
              {workoutData.workoutName}
            </Text>
          </View>
          {exercises[currentExercise].video ? (
            <Video
              shouldPlay={false}
              style={{
                width: "100%",
                height: 200,
              }}
              source={{ uri: exercises[currentExercise].video }}
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
                  autoFocus={true}
                  keyboardType="decimal-pad"
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
                  autoFocus={true}
                  keyboardType="decimal-pad"
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
                      !exercises[currentExercise].weight &&
                      !exercises[currentExercise].reps
                        ? Dimensions.get("screen").width * 0.8
                        : (exercises[currentExercise].weight &&
                            !exercises[currentExercise].reps) ||
                          (!exercises[currentExercise].weight &&
                            exercises[currentExercise].reps)
                        ? Dimensions.get("screen").width * 0.45
                        : Dimensions.get("screen").width * 0.275,
                  }}
                  autoFocus={true}
                  keyboardType="decimal-pad"
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

              await recordedWorkoutRef.get().then((doc) => {
                if (!doc.exists) {
                  console.log("No such document exists.");
                } else {
                  var exerciseInputObject = {};
                  exerciseInputObject.name = exercises[currentExercise].name;
                  numberOfReps
                    ? (exerciseInputObject.reps = numberOfReps)
                    : null;
                  amountOfWeight
                    ? (exerciseInputObject.weight = amountOfWeight)
                    : null;
                  amountOfTime
                    ? (exerciseInputObject.time = amountOfTime)
                    : null;

                  recordedData = doc.data();
                  if (recordedData.exerciseInputData) {
                    let exerciseInputData = [...recordedData.exerciseInputData];
                    exerciseInputData =
                      exerciseInputData.concat(exerciseInputObject);
                    recordedWorkoutRef.update({
                      exerciseInputData: exerciseInputData,
                    });
                  } else {
                    recordedWorkoutRef.update({
                      exerciseInputData: [exerciseInputObject],
                    });
                  }
                }
              });
              if (currentExercise == exercises.length - 1) {
                navigation.navigate("Workout Review", {
                  workoutData: workoutData,
                  exercises: exercises,
                });
              } else {
                navigation.goBack();
              }
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
              <Text style={{ color: "white" }}>Resume</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
  if (!isVideoFinished) {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <Video
          shouldPlay
          style={{
            width: "100%",
            height: "100%",
          }}
          useNativeControls
          resizeMode="contain"
          source={{ uri: exercises[currentExercise].video }}
          onPlaybackStatusUpdate={(playbackStatus) => {
            if (playbackStatus.didJustFinish) setIsVideoFinished(true);
          }}
        />
      </View>
    );
  }
}
