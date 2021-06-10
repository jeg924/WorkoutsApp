import React from "react";
import firebase from "firebase";
import "firebase/firestore";
import "firebase/auth";
import {
  View,
  Text,
  Button,
  ImageBackground,
  Video,
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
  );

  var orderedExercises = [];

  if (exercises) {
    orderedExercises = [...exercises].sort((a, b) => {
      return a.order > b.order ? 1 : -1;
    });
  }

  // load last saved state of workout & exercises
  React.useEffect(() => {
    const workoutRef = firebase
      .firestore()
      .collection("workouts")
      .doc(workoutID);

    workoutRef
      .get()
      .then((doc) => {
        if (!doc.exists) {
          console.log("No such document!");
        } else {
          setWorkout(doc.data());
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log("Error getting document", err);
      });
  }, []);

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
      <ImageBackground
        style={{ width: "100%", height: 200, backgroundColor: "red" }}
        source={workout.workoutImage ? { uri: workout.workoutImage } : {}}
      >
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
              navigation.navigate("Workout Info Form", { workoutID: workoutID })
            }
          />
          <Button
            title="Publish"
            onPress={() => {
              // need to change the minute counting to be a listener
              // that listens to changes in firebase when a new exercise with
              // this workout ID is added.
              // that way publish will only publish.
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

              workoutRef.update({
                published: true,
                lengthInMinutes: lengthInMinutes,
              });
              navigation.navigate("My Workouts");
            }}
          />
        </View>
        <View style={{ marginTop: 50, marginLeft: 10 }}>
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            {workout.workoutName}
          </Text>
        </View>
      </ImageBackground>
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
