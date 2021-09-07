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
import { Feather } from "@expo/vector-icons";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";

export default function WorkoutEditor({ navigation, route }) {
  const { workoutID } = route.params;
  const [loading, setLoading] = React.useState(true);
  const [workout, setWorkout] = React.useState(null);
  const [authorName, setAuthorName] = React.useState(null);

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
    // todo: current problem. get author name.
    try {
      setLoading(true);
      const workoutRef = firebase
        .firestore()
        .collection("workouts")
        .doc(workoutID);

      const workoutDoc = await workoutRef.get();
      const workoutData = workoutDoc.data();
      await Image.prefetch(workoutData.workoutImage);
      setWorkout(workoutData);

      const userRef = firebase
        .firestore()
        .collection("users")
        .doc(workoutData.authorID);

      const userDoc = await userRef.get();
      const user = userDoc.data();
      setAuthorName(user.displayName);
    } catch (error) {
      console.log("error is " + error);
    } finally {
      setLoading(false);
    }
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
    <View style={{ flex: 1, marginTop: 20, backgroundColor: "white" }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
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
          <Text style={{ fontSize: 30, fontWeight: "bold", margin: 10 }}>
            Add Exercises
          </Text>
        </View>
        <View style={{ flex: 1 }}></View>
      </View>
      <View style={{ flex: 3 }}>
        <Image
          style={{ width: "100%", height: "100%" }}
          source={{ uri: workout.workoutImage, cache: "force-cache" }}
        ></Image>
      </View>
      <View style={{ flex: 0.7, flexDirection: "row" }}>
        <View style={{ flex: 1 }}></View>
        <View style={{ flex: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            {workout.workoutName}
          </Text>
          <Text style={{ fontSize: 14 }}>{"by " + authorName}</Text>
        </View>
        <View style={{ flex: 1 }}></View>
      </View>
      <View style={{ flex: 4 }}>
        {eloading ? (
          console.log(eloading)
        ) : (
          <FlatList
            style={{}}
            data={orderedExercises}
            ListFooterComponent={
              orderedExercises.length ? (
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <SolidButton
                    title="Add an Exercise"
                    onPress={() => {
                      navigation.navigate("Record Exercise", {
                        order: exercises.length,
                        exerciseObj: null,
                        workoutID: workoutID,
                      });
                    }}
                  />
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 1,

                      flexDirection: "row",
                    }}
                  >
                    <View style={{ flex: 1 }}></View>
                    <View style={{ flex: 2, alignItems: "center" }}>
                      <Text style={{ fontWeight: "500", textAlign: "center" }}>
                        To get started, add your first exercise video.
                      </Text>
                      <Text></Text>
                    </View>
                    <View style={{ flex: 1 }}></View>
                  </View>
                  <View style={{ width: "70%", alignItems: "center" }}>
                    <SolidButton
                      title="Add an Exercise"
                      onPress={() => {
                        navigation.navigate("Record Exercise", {
                          order: exercises.length,
                          exerciseObj: null,
                          workoutID: workoutID,
                        });
                      }}
                    />
                  </View>
                </View>
              )
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
      </View>
      {orderedExercises.length ? (
        <View>
          <SecondaryButton title="Finish" />
        </View>
      ) : null}
    </View>
  );
}
