import React from "react";
import firebase from "firebase";
import "firebase/firestore";
import "firebase/auth";
import { View, Text, Image, FlatList } from "react-native";
import { DisplayTimeSegment } from "../UtilityFunctions";
import { useCollectionData } from "react-firebase-hooks/firestore";
import SolidButton from "../components/SolidButton";
import SecondaryButton from "../components/SecondaryButton";
import Header from "../components/Header";
import Svg, { Circle, Line } from "react-native-svg";
import { useTheme } from "@react-navigation/native";

export default function WorkoutEditor({ navigation, route }) {
  const { workoutID } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [workout, setWorkout] = React.useState(null);
  const [authorName, setAuthorName] = React.useState(null);

  const flatListRef = React.useRef();
  const [exercises, eloading, error] = useCollectionData(
    firebase
      .firestore()
      .collection("exercises")
      .where("workoutID", "==", workoutID)
      .where("deleted", "==", false)
  );

  var orderedExercises = React.useMemo(() => {
    if (exercises) {
      return [...exercises].sort((a, b) => {
        return a.order > b.order ? 1 : -1;
      });
    }
    return [];
  }, [exercises]);

  React.useEffect(() => {
    if (flatListRef.current) {
      console.log("EXERCISES", orderedExercises.length);
      flatListRef.current.getScrollResponder().scrollResponderScrollToEnd({
        animated: true,
      });
    }
  }, [loading, eloading, navigation, orderedExercises.length]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (flatListRef.current) {
        flatListRef.current.getScrollResponder().scrollResponderScrollToEnd({
          animated: true,
        });
      }
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    loadWorkoutData();
  }, [workoutID]);

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
  if (loading || eloading) {
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
      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        data={orderedExercises}
        keyExtractor={(x) => x.id}
        // initialScrollIndex={orderedExercises.length - 1}
        onScrollToIndexFailed={console.error}
        getItemLayout={(item, index) => {
          return {
            length: 100,
            offset: 100 * index,
            index,
          };
        }}
        ListHeaderComponent={
          <View style={{ height: 250 }}>
            <View style={{ height: 200 }}>
              <Image
                style={{ width: "100%", height: "100%" }}
                source={
                  workout?.workoutImage
                    ? { uri: workout.workoutImage, cache: "force-cache" }
                    : require("../assets/placeholder-image.png")
                }
              />
            </View>
            <View
              style={{
                height: 50,
                justifyContent: "center",
                borderBottomColor: "black",
                borderBottomWidth: 1,
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                {workout.workoutName}
              </Text>
              <Text>{"by " + authorName}</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          orderedExercises.length ? (
            <View
              style={{
                height: 100,
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 1 }}>
                <Svg height={100} width={50}>
                  <Line
                    x1="15"
                    y1="0"
                    x2="15"
                    y2="40"
                    stroke="black"
                    strokeWidth="1"
                  />
                  <Circle
                    cx="15"
                    cy="50"
                    r="8"
                    stroke={colors.primary}
                    strokeWidth="2"
                    fill={colors.notification}
                  />
                </Svg>
              </View>
              <View style={{ flex: 10, justifyContent: "center" }}>
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
          ) : (
            <View
              style={{
                flex: 1,
                height: 200,
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}></View>
                <View style={{ flex: 2, alignItems: "center" }}>
                  <Text style={{ fontWeight: "500", textAlign: "center" }}>
                    To get started, add your first exercise video.
                  </Text>
                </View>
                <View style={{ flex: 1 }}></View>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
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
          <View style={{ flexDirection: "row", height: 100 }}>
            <View style={{ flex: 1 }}>
              <Svg height={100} width={50}>
                <Line
                  x1="15"
                  y1="0"
                  x2="15"
                  y2="40"
                  stroke="black"
                  strokeWidth="1"
                />
                <Circle
                  cx="15"
                  cy="50"
                  r="8"
                  stroke={colors.primary}
                  strokeWidth="2"
                  fill={colors.primary}
                />
                <Line
                  x1="15"
                  y1="60"
                  x2="15"
                  y2="100"
                  stroke="black"
                  strokeWidth="1"
                />
              </Svg>
            </View>
            <View style={{ flex: 5, justifyContent: "center" }}>
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
            <View style={{ flex: 5, justifyContent: "center" }}>
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
