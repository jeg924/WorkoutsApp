import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Dimensions,
  Modal,
} from "react-native";
import firebase from "firebase";
import { Video } from "expo-av";
import { Picker } from "@react-native-picker/picker";
import { min } from "react-native-reanimated";
import MyButton from "../components/Button";
import { Button } from "native-base";

export default function WorkoutVideoScreen({ navigation, route }) {
  const { recordID, workout, currentExercise, exercises } = route.params;
  const user = firebase.auth().currentUser.uid;
  const [amountOfWeight, setAmountOfWeight] = React.useState(null);
  const [numberOfReps, setNumberOfReps] = React.useState(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [seconds, setSeconds] = React.useState(null);
  const [minutes, setMinutes] = React.useState(null);

  async function continueWorkout() {
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
      exerciseInputObject.time = minutes * 60 + seconds;

      if (recordedWorkout.exerciseInputData) {
        let exerciseInputData = [...recordedWorkout.exerciseInputData];
        exerciseInputData = exerciseInputData.concat(exerciseInputObject);
        await recordedWorkoutRef.set(
          {
            exerciseInputData: exerciseInputData,
          },
          { merge: true }
        );
      } else {
        await recordedWorkoutRef.set(
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
  }

  console.log("minutes: " + minutes);
  console.log("seconds: " + seconds);

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
          {exercises[currentExercise].time ? (
            <View style={{ padding: 10 }}>
              <MyButton
                title="Time"
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
              />
              <Modal animationType="slide" visible={modalVisible}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <Picker
                    style={{ width: "50%" }}
                    selectedValue={minutes}
                    onValueChange={(itemValue) => setMinutes(itemValue)}
                  >
                    <Picker.Item label="0 min" value={0} />
                    <Picker.Item label="1 min" value={1} />
                    <Picker.Item label="2 min" value={2} />
                    <Picker.Item label="3 min" value={3} />
                    <Picker.Item label="4 min" value={4} />
                    <Picker.Item label="5 min" value={5} />
                    <Picker.Item label="6 min" value={6} />
                    <Picker.Item label="7 min" value={7} />
                    <Picker.Item label="8 min" value={8} />
                    <Picker.Item label="9 min" value={9} />
                  </Picker>
                  <Picker
                    style={{ width: "50%" }}
                    selectedValue={seconds}
                    onValueChange={(itemValue) => setSeconds(itemValue)}
                  >
                    <Picker.Item label="0 sec" value={0} />
                    <Picker.Item label="1 sec" value={1} />
                    <Picker.Item label="2 sec" value={2} />
                    <Picker.Item label="3 sec" value={3} />
                    <Picker.Item label="4 sec" value={4} />
                    <Picker.Item label="5 sec" value={5} />
                    <Picker.Item label="6 sec" value={6} />
                    <Picker.Item label="7 sec" value={7} />
                    <Picker.Item label="8 sec" value={8} />
                    <Picker.Item label="9 sec" value={9} />
                    <Picker.Item label="10 sec" value={10} />
                    <Picker.Item label="11 sec" value={11} />
                    <Picker.Item label="12 sec" value={12} />
                    <Picker.Item label="13 sec" value={13} />
                    <Picker.Item label="14 sec" value={14} />
                    <Picker.Item label="15 sec" value={15} />
                    <Picker.Item label="16 sec" value={16} />
                    <Picker.Item label="17 sec" value={17} />
                    <Picker.Item label="18 sec" value={18} />
                    <Picker.Item label="19 sec" value={19} />
                    <Picker.Item label="20 sec" value={20} />
                    <Picker.Item label="21 sec" value={21} />
                    <Picker.Item label="22 sec" value={22} />
                    <Picker.Item label="23 sec" value={23} />
                    <Picker.Item label="24 sec" value={24} />
                    <Picker.Item label="25 sec" value={25} />
                    <Picker.Item label="26 sec" value={26} />
                    <Picker.Item label="27 sec" value={27} />
                    <Picker.Item label="28 sec" value={28} />
                    <Picker.Item label="29 sec" value={29} />
                    <Picker.Item label="30 sec" value={30} />
                    <Picker.Item label="31 sec" value={31} />
                    <Picker.Item label="32 sec" value={32} />
                    <Picker.Item label="33 sec" value={33} />
                    <Picker.Item label="34 sec" value={34} />
                    <Picker.Item label="35 sec" value={35} />
                    <Picker.Item label="36 sec" value={36} />
                    <Picker.Item label="37 sec" value={37} />
                    <Picker.Item label="38 sec" value={38} />
                    <Picker.Item label="39 sec" value={39} />
                    <Picker.Item label="40 sec" value={40} />
                    <Picker.Item label="41 sec" value={41} />
                    <Picker.Item label="42 sec" value={42} />
                    <Picker.Item label="43 sec" value={43} />
                    <Picker.Item label="44 sec" value={44} />
                    <Picker.Item label="45 sec" value={45} />
                    <Picker.Item label="46 sec" value={46} />
                    <Picker.Item label="47 sec" value={47} />
                    <Picker.Item label="48 sec" value={48} />
                    <Picker.Item label="49 sec" value={49} />
                    <Picker.Item label="50 sec" value={50} />
                    <Picker.Item label="51 sec" value={51} />
                    <Picker.Item label="52 sec" value={52} />
                    <Picker.Item label="53 sec" value={53} />
                    <Picker.Item label="54 sec" value={54} />
                    <Picker.Item label="55 sec" value={55} />
                    <Picker.Item label="56 sec" value={56} />
                    <Picker.Item label="57 sec" value={57} />
                    <Picker.Item label="58 sec" value={58} />
                    <Picker.Item label="59 sec" value={59} />
                  </Picker>
                </View>
                <View>
                  <MyButton
                    title="done"
                    onPress={() => setModalVisible(!modalVisible)}
                  ></MyButton>
                </View>
              </Modal>
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
        </View>
        <TouchableHighlight onPress={continueWorkout}>
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
