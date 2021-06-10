import React from "react";
import firebase from "firebase";
import "firebase/firestore";
import { View, Text, Button, TextInput } from "react-native";
import { Switch } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { Video } from "expo-av";

export default function RecordExercise({ navigation, route }) {
  const { order, exerciseObj, workoutID } = route.params;
  const [saving, setSaving] = React.useState(false);

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
        <Text>Saving...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          margin: 10,
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 20 }}>Add exercise</Text>
        <Button title="Cancel" onPress={() => navigation.goBack()} />
      </View>
      <View>
        <Text
          style={{
            marginTop: 10,
            paddingLeft: 10,
          }}
        >
          Name for this exercise
        </Text>
        <TextInput
          style={{
            borderColor: "#000000",
            borderWidth: 1,
            padding: 10,
            width: "80%",
            marginLeft: 10,
          }}
          value={exerciseName}
          onChangeText={(x) => setExerciseName(x)}
        ></TextInput>
      </View>
      <View style={{ marginLeft: 10, marginTop: 10 }}>
        <Text style={{ fontWeight: "bold" }}>Exercise Video</Text>
      </View>
      {exerciseVideo ? (
        <View style={{ flex: 1 }}>
          <Video
            source={{ uri: exerciseVideo }}
            onLoad={(data) => {
              setExerciseVideoDuration(data.durationMillis);
            }}
            style={{ width: "80%", height: 100 }}
          />
          <Button
            title="Replace"
            onPress={() => {
              setExerciseVideo(null);
              setExerciseVideoDuration(null);
            }}
          />
        </View>
      ) : (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Button
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
                }
              }
            }}
          />
          <Text style={{ fontWeight: "bold" }}>OR</Text>
          <Button
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
                  alert("Sorry, we need camera permissions to make this work");
                }
                let result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                  allowsEditing: true,
                });

                if (!result.cancelled) {
                  setExerciseVideo(result.uri);
                }
              }
            }}
          />
        </View>
      )}
      <View style={{ padding: 10 }}>
        <Text>Stats to track</Text>
        <View style={{ flexDirection: "row" }}>
          <Switch
            value={trackReps}
            onValueChange={setTrackReps}
            style={{ alignSelf: "center" }}
          />
          <Text style={{ margin: 8 }}>Number of reps</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Switch
            value={trackWeight}
            onValueChange={setTrackWeight}
            style={{ alignSelf: "center" }}
          />
          <Text style={{ margin: 8 }}>Weight of dumbbells or bands used</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Switch
            value={trackTime}
            onValueChange={setTrackTime}
            style={{ alignSelf: "center" }}
          />
          <Text style={{ margin: 8 }}>Length of time</Text>
        </View>
      </View>
      <View>
        <Button
          title="Save exercise"
          onPress={async () => {
            setSaving(true);
            try {
              if (exerciseObj) {
                const exerciseRef = firebase
                  .firestore()
                  .collection("exercises")
                  .doc(exerciseObj.id);

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
                };
                exerciseRef.update(exerciseData); // same as merge
              } else {
                const exerciseRef = firebase
                  .firestore()
                  .collection("exercises")
                  .doc();

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
                };

                await exerciseRef.set(exerciseData);
              }
            } catch (error) {
              alert(error.message);
            }

            navigation.goBack();
          }}
        />
      </View>
    </View>
  );
}
