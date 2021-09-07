import React from "react";
import firebase from "firebase";
import "firebase/firestore";
import {
  View,
  Text,
  Button,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Switch } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { Video } from "expo-av";
import { concat, set } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import SecondaryButton from "../components/SecondaryButton";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import SolidButton from "../components/SolidButton";

export default function RecordExercise({ navigation, route }) {
  const { order, exerciseObj, workoutID } = route.params;

  const [saving, setSaving] = React.useState(false);

  const [replacedVideo, setReplacedVideo] = React.useState(false);
  const [exerciseName, setExerciseName] = React.useState(
    exerciseObj ? exerciseObj.name : ""
  );
  const [exerciseVideo, setExerciseVideo] = React.useState(
    exerciseObj ? exerciseObj.video : null
  );
  const [exerciseVideoDuration, setExerciseVideoDuration] = React.useState(
    exerciseObj ? exerciseObj.duration : null
  );
  const [trackReps, setTrackReps] = React.useState(
    exerciseObj ? exerciseObj.reps : false
  );
  const [trackWeight, setTrackWeight] = React.useState(
    exerciseObj ? exerciseObj.weight : false
  );
  const [trackTime, setTrackTime] = React.useState(
    exerciseObj ? exerciseObj.time : false
  );

  if (saving) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Uploading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginTop: 20, backgroundColor: "white" }}>
      <View style={{ height: "55%" }}>
        <View
          style={{
            flex: 1.1,
            flexDirection: "row",
            backgroundColor: "orange",
          }}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Feather name="chevron-left" size={30} />
          </View>
          <View
            style={{ flex: 4, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>
              Add Exercise
            </Text>
          </View>
          <View style={{ flex: 1 }}></View>
        </View>
        <View
          style={{ flex: 1.4, flexDirection: "row", backgroundColor: "yellow" }}
        >
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 13 }}>
            <Text style={{ fontWeight: "bold" }}>Exercise Name</Text>
            <TextInput
              style={{
                borderRadius: 10,
                borderWidth: 1,
                padding: 10,
                width: "100%",
              }}
              onChangeText={(x) => {
                setExerciseName(x);
              }}
              defaultValue={exerciseName}
            ></TextInput>
          </View>
          <View style={{ flex: 1 }}></View>
        </View>
        <View style={{ flex: 0.3, flexDirection: "row" }}>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 13, justifyContent: "flex-end" }}>
            <Text style={{ fontWeight: "bold" }}>Exercise Video</Text>
          </View>
          <View style={{ flex: 1 }}></View>
        </View>
        <View
          style={{ flex: 1.3, flexDirection: "row", backgroundColor: "green" }}
        >
          <View style={{ flex: 1 }}></View>
          <View
            style={{ flex: 6, justifyContent: "center", alignItems: "center" }}
          >
            <SecondaryButton
              title="Record Video"
              onPress={async () => {
                if (Constants.platform.ios) {
                  const { status } =
                    await ImagePicker.getCameraPermissionsAsync();
                  if (status !== "granted") {
                    status = await ImagePicker.requestCameraPermissionsAsync();
                  }
                  if (status !== "granted") {
                    alert(
                      "You need to grant camera permissions before you can record a video."
                    );
                  }

                  let result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                    allowsEditing: true,
                  });

                  if (!result.cancelled) {
                    setExerciseVideo(result.uri);
                    setReplacedVideo(true);
                  }
                }
              }}
            />
          </View>
          <View
            style={{ flex: 3, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              OR
            </Text>
          </View>
          <View
            style={{ flex: 6, justifyContent: "center", alignItems: "center" }}
          >
            <SecondaryButton
              title="Upload Video"
              onPress={async () => {
                if (Constants.platform.ios) {
                  let { status } =
                    await ImagePicker.getCameraRollPermissionsAsync();
                  if (status !== "granted") {
                    status =
                      await ImagePicker.requestCameraRollPermissionsAsync();
                  }
                  if (status !== "granted") {
                    alert(
                      "Sorry, we need camera permissions to make this work"
                    );
                  }
                  let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                    allowsEditing: true,
                  });

                  if (!result.cancelled) {
                    setExerciseVideo(result.uri);
                    setReplacedVideo(true);
                  }
                }
              }}
            />
          </View>
          <View style={{ flex: 1 }}></View>
        </View>

        <View style={{ flex: 3, backgroundColor: "cyan" }}>
          <View style={{ flex: 0.6, flexDirection: "row" }}>
            <View style={{ flex: 1 }}></View>
            <View style={{ flex: 13, justifyContent: "flex-end" }}>
              <Text style={{ fontWeight: "bold" }}>Stats to Track</Text>
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              margin: "1%",
            }}
          >
            <BouncyCheckbox
              isChecked={trackReps}
              size={25}
              fillColor="blue"
              unfillColor="#FFFFFF"
              iconStyle={{ borderColor: "blue" }}
              textStyle={{}}
              onPress={() => {
                setTrackReps(!trackReps);
              }}
            />
            <Text>Number of Reps</Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              margin: "1%",
            }}
          >
            <BouncyCheckbox
              isChecked={trackWeight}
              size={25}
              fillColor="blue"
              unfillColor="#FFFFFF"
              iconStyle={{ borderColor: "blue" }}
              textStyle={{}}
              onPress={() => {
                setTrackWeight(!trackWeight);
              }}
            />
            <Text>Weight of dumbbells or bands used</Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              margin: "1%",
            }}
          >
            <BouncyCheckbox
              isChecked={trackTime}
              size={25}
              fillColor="blue"
              unfillColor="#FFFFFF"
              iconStyle={{ borderColor: "blue" }}
              textStyle={{}}
              onPress={() => {
                setTrackTime(!trackTime);
              }}
            />
            <Text>Length of Time</Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 3, backgroundColor: "red" }}></View>
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={20}>
        <View
          style={{
            backgroundColor: "orange",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SolidButton
            title="Save exercise"
            onPress={async () => {
              setSaving(true);

              // 1. check if existing excercise
              // 1a. If no existing exercise, create
              // 2. check if new video
              // 2a. if new video, upload
              // 3. update exercise w/ video url any anything else

              try {
                var exerciseRef = {};
                if (exerciseObj) {
                  exerciseRef = firebase
                    .firestore()
                    .collection("exercises")
                    .doc(exerciseObj.id);
                } else {
                  exerciseRef = firebase
                    .firestore()
                    .collection("exercises")
                    .doc();
                }
                if (!replacedVideo) {
                  const exerciseData = {
                    id: exerciseRef.id,
                    name: exerciseName,
                    video: exerciseVideo,
                    duration: exerciseVideoDuration,
                    reps: trackReps,
                    weight: trackWeight,
                    time: trackTime,
                    order: order,
                    workoutID: workoutID,
                    deleted: false,
                  };
                  exerciseRef.set(exerciseData, { merge: true });
                  navigation.goBack();
                  return;
                }

                // update storage
                const response = await fetch(exerciseVideo);
                const blob = await response.blob();

                const uploadTask = firebase
                  .storage()
                  .ref()
                  .child("exerciseVideos")
                  .child(exerciseRef.id + ".mp4")
                  .put(blob);

                // Register three observers:
                // 1. 'state_changed' observer, called any time the state changes
                // 2. Error observer, called on failure
                // 3. Completion observer, called on successful completion
                uploadTask.on(
                  "state_changed",
                  (snapshot) => {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    var progress =
                      (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log("Upload is " + progress + "% done");
                    switch (snapshot.state) {
                      case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log("Upload is paused");
                        break;
                      case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log("Upload is running");
                        break;
                    }
                  },
                  (error) => {
                    // Handle unsuccessful uploads
                  },
                  async () => {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    const downloadURL =
                      await uploadTask.snapshot.ref.getDownloadURL();
                    setExerciseVideo(downloadURL);
                  }
                );
                await uploadTask;

                const exerciseData = {
                  id: exerciseRef.id,
                  name: exerciseName,
                  video: exerciseVideo,
                  duration: exerciseVideoDuration,
                  reps: trackReps,
                  weight: trackWeight,
                  time: trackTime,
                  order: order,
                  workoutID: workoutID,
                  deleted: false,
                };
                exerciseRef.set(exerciseData, { merge: true });
                navigation.goBack();
              } catch (error) {
                alert(error.message);
              }
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
