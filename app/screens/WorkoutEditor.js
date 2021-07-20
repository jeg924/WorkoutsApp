import React from "react";
import firebase from "firebase";
import "firebase/firestore";
import "firebase/auth";
import {
  View,
  Text,
  Button,
  ImageBackground,
  Image,
  FlatList,
  SafeAreaView,
} from "react-native";
import { DisplayTimeSegment } from "../UtilityFunctions";
import { useCollectionData } from "react-firebase-hooks/firestore";

export default function WorkoutEditor({ navigation, route }) {
  const { workoutID } = route.params;
  const [loading, setLoading] = React.useState(true);
  const [workout, setWorkout] = React.useState(null);

  const [exercises, eloading, error] = useCollectionData(
    firebase
      .firestore()
      .collection("exercises")
      .where("workoutID", "==", workoutID)
      .where("deleted", "==", false)
  );

  var orderedExercises = [];

  if (exercises) {
    orderedExercises = [...exercises].sort((a, b) => {
      return a.order > b.order ? 1 : -1;
    });
  }
  // load last saved state of workout & exercises
  React.useEffect(() => {
    loadWorkoutData();
  }, []);

  async function loadWorkoutData() {
    setLoading(true);
    const workoutRef = firebase
      .firestore()
      .collection("workouts")
      .doc(workoutID);

    const workoutDoc = await workoutRef.get();
    const workoutData = workoutDoc.data();
    await Image.prefetch(workoutData.workoutImage);
    setWorkout(workoutData);
    setLoading(false);
  }

  // gotta get the info from firebase instead of route params.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        <Button
          title="Edit Workout Details"
          onPress={() =>
            navigation.navigate("Workout Info Form", {
              workoutID: workoutID,
            })
          }
        />
        <Button
          title="Publish"
          onPress={async () => {
            // need to change the minute counting to be a listener
            // that listens to changes in firebase when a new exercise with
            // this workout ID is added.
            // that way the publish button will only publish.

            console.log(orderedExercises.length);

            let lengthInMinutes = 0;
            for (let i = 0; i < orderedExercises.length; ++i) {
              lengthInMinutes += Math.floor(
                (orderedExercises[i].duration / (1000 * 60)) % 60
              );
            }

            const workoutRef = firebase
              .firestore()
              .collection("workouts")
              .doc(workoutID);

            await workoutRef.set(
              {
                published: true,
                lengthInMinutes: lengthInMinutes,
              },
              { merge: true }
            );
            console.log("got here with no problem");
            navigation.navigate("My Workouts");
          }}
        />
      </View>
      <Image
        style={{ width: "100%", height: "30%", backgroundColor: "red" }}
        source={{ uri: workout.workoutImage, cache: "force-cache" }}
      ></Image>
      <View style={{ marginTop: 50, marginLeft: 10 }}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          {workout.workoutName}
        </Text>
      </View>
      <SafeAreaView style={{ flex: 1 }}>
        {eloading ? (
          console.log(eloading)
        ) : (
          <FlatList
            style={{}}
            data={orderedExercises}
            ListFooterComponent={
              <Button
                title="Add an Exercise"
                onPress={() => {
                  navigation.navigate("Record Exercise", {
                    order: exercises.length,
                    exerciseObj: null,
                    workoutID: workoutID,
                  });
                }}
              />
            }
            renderItem={({ item }) => (
              <View style={{ flexDirection: "row" }}>
                <View>
                  <Text>
                    {DisplayTimeSegment(
                      orderedExercises,
                      item.order,
                      item.duration
                    )}
                  </Text>
                  <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                  <Text>{item.reps ? "reps" : ""}</Text>
                  <Text>{item.weight ? "weight" : ""}</Text>
                  <Text>{item.time ? "time" : ""}</Text>
                </View>
                <View>
                  <Button
                    title="Edit exercise"
                    onPress={() => {
                      navigation.navigate("Record Exercise", {
                        order: item.order,
                        exerciseObj: item,
                        workoutID: workoutID,
                      });
                    }}
                  />
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
