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
  ScrollView,
} from "react-native";
import { DisplayTimeSegment } from "../UtilityFunctions";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Feather } from "@expo/vector-icons";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import Header from "../components/Header";
import Svg, { Circle, Line } from "react-native-svg";

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

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadWorkoutData();
    });

    return unsubscribe;
  }, [navigation]);

  async function loadWorkoutData() {
    // todo: current problem. get author name.
    try {
      setLoading(true);
      const workoutRef = firebase
        .firestore()
        .collection("workouts")
        .doc(workoutID);

      const workoutDoc = await workoutRef.get();
      const workout = workoutDoc.data();
      if (workout?.workoutImage) {
        console.log("got here");
        console.log(workout.workoutImage);
        await Image.prefetch(workout.workoutImage);
      }

      setWorkout(workout);
      console.log("got here 2");
      console.log(workout.authorID);
      const userRef = firebase
        .firestore()
        .collection("users")
        .doc(workout.authorID);

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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Header
        title="Add Exercises"
        navigation={navigation}
        route={{
          screen: "Workout Info Form",
          params: { workoutID: workoutID },
        }}
      />
      <ScrollView>
        <View style={{ flex: 1 }}>
          <View style={{ width: "100%", height: 200 }}>
            {workout?.workoutImage ? (
              <Image
                style={{ width: "100%", height: "100%" }}
                source={{ uri: workout.workoutImage, cache: "force-cache" }}
              ></Image>
            ) : (
              <View></View>
            )}
          </View>
          <View
            style={{
              flex: 0.7,
              flexDirection: "row",
              borderBottomColor: "black",
              borderBottomWidth: 1,
            }}
          >
            <View style={{ flex: 1 }}></View>
            <View style={{ flex: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                {workout.workoutName}
              </Text>
              <Text style={{ fontSize: 14 }}>{"by " + authorName}</Text>
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
          <View style={{ flex: 4, flexDirection: "row" }}>
            <View style={{ flex: 0.4 }}>
              {orderedExercises.map((exercise) => {
                return (
                  <View>
                    <Svg height={79} width={50}>
                      <Line
                        x1="15"
                        y1="0"
                        x2="15"
                        y2="66"
                        stroke="black"
                        strokeWidth="1"
                      />
                      <Circle
                        cx="15"
                        cy="70"
                        r="8"
                        stroke="blue"
                        strokeWidth="2"
                        fill="blue"
                      />
                    </Svg>
                  </View>
                );
              })}
              {orderedExercises.length ? (
                <View>
                  <Svg height={79} width={50}>
                    <Line
                      x1="15"
                      y1="0"
                      x2="15"
                      y2="66"
                      stroke="black"
                      strokeWidth="1"
                    />
                    <Circle
                      cx="15"
                      cy="70"
                      r="8"
                      stroke="blue"
                      strokeWidth="2"
                      fill="indigo"
                    />
                  </Svg>
                </View>
              ) : null}
            </View>
            <View style={{ flex: 4 }}>
              <View style={{ height: 44 }}></View>
              <FlatList
                style={{}}
                data={orderedExercises}
                ListFooterComponent={
                  orderedExercises.length ? (
                    <View
                      style={{
                        justifyContent: "flex-end",
                        width: "70%",
                      }}
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
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <View
                        style={{
                          flex: 10,
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
                            <Text
                              style={{ fontWeight: "500", textAlign: "center" }}
                            >
                              To get started, add your first exercise video.
                            </Text>
                            <Text></Text>
                          </View>
                          <View style={{ flex: 1 }}></View>
                        </View>
                        <View style={{ width: "80%", alignItems: "center" }}>
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
                      <View style={{ flex: 1 }}></View>
                    </View>
                  )
                }
                renderItem={({ item }) => (
                  <View style={{ flexDirection: "row", height: 80 }}>
                    <View style={{ flex: 2 }}>
                      <Text>
                        {DisplayTimeSegment(
                          orderedExercises,
                          item.order,
                          item.duration
                        )}
                      </Text>
                      <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                      {item.reps && item.weight && item.time ? (
                        <Text>Reps & Weight & Time</Text>
                      ) : item.reps && item.weight && !item.time ? (
                        <Text>Reps & Weight</Text>
                      ) : item.reps && item.time && !item.weight ? (
                        <Text>Reps & Time</Text>
                      ) : item.weight && item.time && !item.reps ? (
                        <Text>Weight & Time</Text>
                      ) : item.reps && !item.weight && !item.time ? (
                        <Text>Reps</Text>
                      ) : item.weight && !item.reps && !item.time ? (
                        <Text>Weight</Text>
                      ) : (
                        <Text>Time</Text>
                      )}
                    </View>
                    <View style={{ flex: 2 }}>
                      <SecondaryButton
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
            </View>
          </View>
        </View>
      </ScrollView>
      {orderedExercises.length ? (
        <View style={{ alignItems: "center" }}>
          <SecondaryButton
            title="Done"
            onPress={() => {
              navigation.navigate("My Workouts");
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
